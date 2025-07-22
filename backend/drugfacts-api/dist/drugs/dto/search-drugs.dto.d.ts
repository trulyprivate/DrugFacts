export declare enum SearchType {
    WEIGHTED = "weighted",
    TEXT = "text",
    STANDARD = "standard"
}
export declare class SearchDrugsDto {
    q?: string;
    therapeuticClass?: string;
    manufacturer?: string;
    page?: number;
    limit?: number;
    searchType?: SearchType;
}
