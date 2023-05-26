export const suspenseWrapper = (promise: Promise<any>) => {
    let status = 'pending';
    let response: any;
    
    const suspender = promise.then(
        (res) => {
            status = 'success';
            response = res;
        },
        (err) => {
            status = 'error';
            response = err;
        }
    );

    // for Suspense component to check the status of the data fetching (promise)
    const read = () => {
        switch(status) {
            case 'pending': // status is pending until promise resolves or rejects
                throw suspender;
            case 'error':
                throw response;
            default: // success
                return response;
        }
    }

    return { read }
}