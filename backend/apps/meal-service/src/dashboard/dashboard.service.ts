import { Injectable, CacheInterceptor, UseInterceptors } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MonthlyDashboardDto, WeeklyDashboardDto } from './dto/dashboard.dto';
import { MealStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Dashboard Service - Handles user dashboard analytics
 * Calculates meal totals and amounts for user
 */
@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get user dashboard with totals
   * - Fetches all ACTIVE meals for user
   * - Calculates total meal count
   * - Breaks down meals by type (BREAKFAST, LUNCH, DINNER, CUSTOM)
   * - Calculates total amount: SUM(count × priceAtTime)
   * - Returns dashboard object with all metrics
   */
  async getUserDashboard(userId: string) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    // Use database aggregation instead of fetching all records
    const [totalStats, mealsByType] = await Promise.all([
      // Get total meals and amount
      this.prisma.mealRecord.aggregate({
        where: { 
          userId, 
          status: MealStatus.ACTIVE,
          date: { lte: today }
        },
        _sum: {
          count: true,
        },
      }),
      // Get breakdown by type
      this.prisma.mealRecord.groupBy({
        by: ['mealType'],
        where: { 
          userId, 
          status: MealStatus.ACTIVE,
          date: { lte: today }
        },
        _sum: {
          count: true,
        },
      }),
    ]);

    // Calculate amounts (need raw query for decimal multiplication)
    const amountData = await this.prisma.$queryRaw<Array<{ mealType: string; totalAmount: number; count: number }>>`
      SELECT 
        "mealType",
        SUM("count" * "priceAtTime")::numeric as "totalAmount",
        SUM("count")::integer as count
      FROM meal_records
      WHERE "userId" = ${userId}::uuid 
        AND status = 'ACTIVE'
        AND date <= ${today}
      GROUP BY "mealType"
    `;

    const totalMeals = totalStats._sum.count || 0;
    const byType = mealsByType.reduce((acc, item) => {
      acc[item.mealType] = item._sum.count || 0;
      return acc;
    }, {} as Record<string, number>);

    const totalAmount = amountData.reduce((sum, item) => sum + Number(item.totalAmount), 0);
    const amountByType = amountData.reduce((acc, item) => {
      acc[item.mealType] = Number(item.totalAmount);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalMeals,
      byType,
      totalAmount,
      amountByType,
    };
  }

  /**
   * Get monthly dashboard with week-by-week breakdown
   */
  async getMonthlyDashboard(userId: string, dto: MonthlyDashboardDto) {
    let year: number, month: number;

    if (dto.month) {
      [year, month] = dto.month.split('-').map(Number);
    } else {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth() + 1;
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const finalEndDate = endDate > today ? today : endDate;

    // Use database aggregation
    const [totalStats, mealsByType, amountData, uniqueDaysResult] = await Promise.all([
      this.prisma.mealRecord.aggregate({
        where: {
          userId,
          status: MealStatus.ACTIVE,
          date: { gte: startDate, lte: finalEndDate },
        },
        _sum: { count: true },
      }),
      this.prisma.mealRecord.groupBy({
        by: ['mealType'],
        where: {
          userId,
          status: MealStatus.ACTIVE,
          date: { gte: startDate, lte: finalEndDate },
        },
        _sum: { count: true },
      }),
      this.prisma.$queryRaw<Array<{ mealType: string; totalAmount: number; weekNum: number }>>`
        SELECT 
          "mealType",
          SUM("count" * "priceAtTime")::numeric as "totalAmount",
          CEIL(EXTRACT(DAY FROM date) / 7.0)::integer as "weekNum"
        FROM meal_records
        WHERE "userId" = ${userId}::uuid 
          AND status = 'ACTIVE'
          AND date >= ${startDate}
          AND date <= ${finalEndDate}
        GROUP BY "mealType", "weekNum"
      `,
      this.prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(DISTINCT date)::integer as count
        FROM meal_records
        WHERE "userId" = ${userId}::uuid 
          AND status = 'ACTIVE'
          AND date >= ${startDate}
          AND date <= ${finalEndDate}
      `,
    ]);

    const totalMeals = totalStats._sum.count || 0;
    const byType = mealsByType.reduce((acc, item) => {
      acc[item.mealType] = item._sum.count || 0;
      return acc;
    }, {} as Record<string, number>);

    const totalAmount = amountData.reduce((sum, item) => sum + Number(item.totalAmount), 0);
    const amountByType = {} as Record<string, number>;
    const byWeek = {} as Record<number, { meals: number; amount: number }>;

    amountData.forEach(item => {
      amountByType[item.mealType] = (amountByType[item.mealType] || 0) + Number(item.totalAmount);
      if (!byWeek[item.weekNum]) byWeek[item.weekNum] = { meals: 0, amount: 0 };
      byWeek[item.weekNum].amount += Number(item.totalAmount);
    });

    // Get meal counts per week
    const weekMeals = await this.prisma.$queryRaw<Array<{ weekNum: number; count: number }>>`
      SELECT 
        CEIL(EXTRACT(DAY FROM date) / 7.0)::integer as "weekNum",
        SUM("count")::integer as count
      FROM meal_records
      WHERE "userId" = ${userId}::uuid 
        AND status = 'ACTIVE'
        AND date >= ${startDate}
        AND date <= ${finalEndDate}
      GROUP BY "weekNum"
    `;

    weekMeals.forEach(item => {
      if (!byWeek[item.weekNum]) byWeek[item.weekNum] = { meals: 0, amount: 0 };
      byWeek[item.weekNum].meals = item.count;
    });

    return {
      month: `${year}-${String(month).padStart(2, '0')}`,
      totalMeals,
      byType,
      totalAmount,
      amountByType,
      daysWithMeals: uniqueDaysResult[0]?.count || 0,
      byWeek,
    };
  }

  /**
   * Get weekly dashboard
   */
  async getWeeklyDashboard(userId: string, dto: WeeklyDashboardDto) {
    let year: number, week: number;

    if (dto.week) {
      [year, week] = dto.week.split('-W').map(Number);
    } else {
      const now = new Date();
      year = now.getFullYear();
      const firstDayOfYear = new Date(year, 0, 1);
      const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
      week = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = (week - 1) * 7;
    const startDate = new Date(firstDayOfYear.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const finalEndDate = endDate > today ? today : endDate;

    // Use database aggregation
    const [totalStats, mealsByType, dailyData] = await Promise.all([
      this.prisma.mealRecord.aggregate({
        where: {
          userId,
          status: MealStatus.ACTIVE,
          date: { gte: startDate, lte: finalEndDate },
        },
        _sum: { count: true },
      }),
      this.prisma.mealRecord.groupBy({
        by: ['mealType'],
        where: {
          userId,
          status: MealStatus.ACTIVE,
          date: { gte: startDate, lte: finalEndDate },
        },
        _sum: { count: true },
      }),
      this.prisma.$queryRaw<Array<{ date: Date; totalAmount: number; count: number }>>`
        SELECT 
          date,
          SUM("count" * "priceAtTime")::numeric as "totalAmount",
          SUM("count")::integer as count
        FROM meal_records
        WHERE "userId" = ${userId}::uuid 
          AND status = 'ACTIVE'
          AND date >= ${startDate}
          AND date <= ${finalEndDate}
        GROUP BY date
        ORDER BY date
      `,
    ]);

    const totalMeals = totalStats._sum.count || 0;
    const byType = mealsByType.reduce((acc, item) => {
      acc[item.mealType] = item._sum.count || 0;
      return acc;
    }, {} as Record<string, number>);

    const totalAmount = dailyData.reduce((sum, item) => sum + Number(item.totalAmount), 0);
    const byDay = dailyData.reduce((acc, item) => {
      const dateKey = new Date(item.date).toISOString().split('T')[0];
      acc[dateKey] = { meals: item.count, amount: Number(item.totalAmount) };
      return acc;
    }, {} as Record<string, { meals: number; amount: number }>);

    return {
      week: `${year}-W${String(week).padStart(2, '0')}`,
      totalMeals,
      byType,
      totalAmount,
      byDay,
    };
  }
}
