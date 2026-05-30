class ResponseAPI<RESPONSE> {

    private _isError: boolean;
    private _response: RESPONSE;

    constructor(isError: boolean, response: RESPONSE) {
        this._isError = isError;
        this._response = response;
    }

    get isError(): boolean {
        return this._isError;
    }

    set isError(value: boolean) {
        this._isError = value;
    }

    get response(): RESPONSE {
        return this._response;
    }

    set response(value: RESPONSE) {
        this._response = value;
    }
}

export default ResponseAPI;