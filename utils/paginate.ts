export function paginate(data: any[], page?: number, limit?: number) {

    if(!page && !limit) {
        return {
            results: data
        }
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedData = data.slice(startIndex, endIndex);

    return {
        page,
        limit,
        totalItems: data.length,
        totalPages: Math.ceil(data.length / limit),
        results: paginatedData
    };
}
