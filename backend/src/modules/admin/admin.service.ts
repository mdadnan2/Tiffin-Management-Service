import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MealStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        meals: {
          where: { status: MealStatus.ACTIVE },
          select: { count: true, priceAtTime: true },
        },
      },
    });

    return users.map((user) => {
      const mealCount = user.meals.reduce((sum, meal) => sum + meal.count, 0);
      const totalAmount = user.meals.reduce((sum, meal) => {
        return sum.add(new Decimal(meal.priceAtTime).mul(meal.count));
      }, new Decimal(0));

      const { meals, ...userData } = user;
      return {
        ...userData,
        mealCount,
        totalAmount: totalAmount.toNumber(),
      };
    });
  }

  async getUserSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        meals: {
          where: { status: MealStatus.ACTIVE },
          select: { count: true, priceAtTime: true, mealType: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    const totalMeals = user.meals.reduce((sum, meal) => sum + meal.count, 0);
    const byType = user.meals.reduce((acc, meal) => {
      acc[meal.mealType] = (acc[meal.mealType] || 0) + meal.count;
      return acc;
    }, {});

    const totalAmount = user.meals.reduce((sum, meal) => {
      return sum.add(new Decimal(meal.priceAtTime).mul(meal.count));
    }, new Decimal(0));

    const { meals, ...userData } = user;
    return {
      user: userData,
      totalMeals,
      byType,
      totalAmount: totalAmount.toNumber(),
    };
  }
}
