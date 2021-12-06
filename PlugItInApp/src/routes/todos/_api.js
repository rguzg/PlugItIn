var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/*
    This module is used by the /todos.json and /todos/[uid].json
    endpoints to make calls to api.svelte.dev, which stores todos
    for each user. The leading underscore indicates that this is
    a private module, _not_ an endpoint — visiting /todos/_api
    will net you a 404 response.

    (The data on the todo app will expire periodically; no
    guarantees are made. Don't use it to organise your life.)
*/
const base = 'https://api.svelte.dev';
export function api(request, resource, data) {
    return __awaiter(this, void 0, void 0, function* () {
        // user must have a cookie set
        if (!request.locals.userid) {
            return { status: 401 };
        }
        const res = yield fetch(`${base}/${resource}`, {
            method: request.method,
            headers: {
                'content-type': 'application/json'
            },
            body: data && JSON.stringify(data)
        });
        // if the request came from a <form> submission, the browser's default
        // behaviour is to show the URL corresponding to the form's "action"
        // attribute. in those cases, we want to redirect them back to the
        // /todos page, rather than showing the response
        if (res.ok && request.method !== 'GET' && request.headers.accept !== 'application/json') {
            return {
                status: 303,
                headers: {
                    location: '/todos'
                }
            };
        }
        return {
            status: res.status,
            body: yield res.json()
        };
    });
}
//# sourceMappingURL=_api.js.map