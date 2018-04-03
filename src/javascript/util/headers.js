export const getAuthHeaders = () => {
    return new Headers({
        'x-access-token': sessionStorage.getItem('token')
    });
};
