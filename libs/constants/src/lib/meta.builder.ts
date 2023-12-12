import { IMeta } from "@myhome/interfaces";
import { ObjectLiteral, SelectQueryBuilder } from "typeorm";

export async function applyMeta<T extends ObjectLiteral>(queryBuilder: SelectQueryBuilder<T>, meta: IMeta):
    Promise<{ queryBuilder: SelectQueryBuilder<T>; totalCount?: number; }> {
    if (meta) {
        const { searchField, searchLine } = meta;

        if (searchField && searchLine) {
            queryBuilder.andWhere(`${searchField} LIKE :searchLine`, { searchLine: `%${searchLine}%` });
        }

        const { filterField, filterArray } = meta;
        if (filterField && filterArray && filterArray.length) {
            queryBuilder.andWhere(`${filterField} IN (:...filterArray)`, { filterArray });
        }

        const totalCount = await queryBuilder.getCount();

        const { page, limit } = meta;
        return {
            queryBuilder: queryBuilder.skip((page - 1) * limit).take(limit),
            totalCount
        };
    }
    return { queryBuilder };
}