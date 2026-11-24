export interface ProductFilter {
    // Price filters
    priceRange?: 'under-100' | '100-199' | '200-299' | '300-plus';
    minPrice?: number;
    maxPrice?: number;

    // Category filters
    parentCategoryIds?: number[]; // Hair Care, Skin Care, Body Care, Others
    categoryIds?: number[]; // Specific product types

    // Size filters
    size?: 'small' | 'medium' | 'large';
    minSize?: number; // grams/ml
    maxSize?: number; // grams/ml

    // Search
    searchTerm?: string;

    // Sorting
    sortBy?: 'price' | 'name' | 'createdAt' | 'rating';
    sortOrder?: 'asc' | 'desc';

    // Pagination
    page?: number;
    limit?: number;

    // Other filters
    featured?: boolean;
    inStock?: boolean;
}

// Category mapping based on your data
export const CATEGORY_MAPPING = {
    // Parent categories
    'Hair Care': 1,
    'Skin Care': 2,
    'Body Care': 3,
    'Others': 4,

    // Sub-categories (Products)
    'Hair Oil': 5,
    'Shampoo': 6,
    'Face Wash': 7,
    'Body Wash': 8,
    'Body Lotion': 10,
};

// Size mapping (weight in kg)
export const SIZE_MAPPING = {
    'Small (≤50ml)': { min: 0, max: 0.05 },
    'Medium (51–250ml)': { min: 0.051, max: 0.25 },
    'Large (250 ml+)': { min: 0.251, max: undefined },
};

// Price ranges
export const PRICE_RANGES = [
    { label: '৳100 <', value: 'under-100', max: 99 },
    { label: '৳100 - ৳199', value: '100-199', min: 100, max: 199 },
    { label: '৳200 - ৳299', value: '200-299', min: 200, max: 299 },
    { label: '৳300 & More', value: '300-plus', min: 300 },
];