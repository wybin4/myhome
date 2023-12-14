import { IMeta } from "@myhome/interfaces";
import { ObjectLiteral, SelectQueryBuilder } from "typeorm";

export async function applyMeta<T extends ObjectLiteral>(queryBuilder: SelectQueryBuilder<T>, meta: IMeta):
    Promise<{ queryBuilder: SelectQueryBuilder<T>; totalCount?: number; }> {
    if (meta) {
        const { search, filters } = meta;

        if (search) {
            const { searchField, searchLine } = search;
            queryBuilder.andWhere(`${searchField} LIKE :searchLine`, { searchLine: `%${searchLine}%` });
        }

        if (filters && filters.length) {
            filters.map(({ filterField, filterArray }) => {
                if ((filterField === "createdAt" || filterField === "expiredAt") && filterArray[0] && filterArray[1]) {
                    const start = new Date(filterArray[0]);
                    const end = new Date(filterArray[1]);
                    queryBuilder.andWhere(`${filterField} BETWEEN :start AND :end`, { start, end });
                } else {
                    queryBuilder.andWhere(`${filterField} IN (${filterArray.map(fa => `"${fa}"`).join(", ")})`);
                }
            });
        }

        const totalCount = await queryBuilder.getCount();

        const { page, limit } = meta;
        return {
            queryBuilder: queryBuilder.skip((page - 1) * limit).take(limit),
            totalCount
        };
    }
    return { queryBuilder, totalCount: undefined };
}