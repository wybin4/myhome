export interface IMeta {
    page: number;
    limit: number;
    search?: {
        searchField: string;
        searchLine: string;
    };
    filters?: {
        filterField: string;
        filterArray: string[];
    }[];
}