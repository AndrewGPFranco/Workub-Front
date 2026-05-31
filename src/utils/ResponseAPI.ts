class ResponseAPI<RESPONSE> {

    constructor(
        public httpStatusCode: number,
        public data: RESPONSE,
    ) {
    }

    get isError(): boolean {
        return this.httpStatusCode >= 400;
    }

    get response(): RESPONSE {
        return this.data;
    }
}

export default ResponseAPI;
