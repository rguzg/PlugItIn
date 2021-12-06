var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { api } from './_api';
// GET /todos.json
export const get = (request) => __awaiter(void 0, void 0, void 0, function* () {
    // request.locals.userid comes from src/hooks.js
    const response = yield api(request, `todos/${request.locals.userid}`);
    if (response.status === 404) {
        // user hasn't created a todo list.
        // start with an empty array
        return { body: [] };
    }
    return response;
});
// POST /todos.json
export const post = (request) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield api(request, `todos/${request.locals.userid}`, {
        // because index.svelte posts a FormData object,
        // request.body is _also_ a (readonly) FormData
        // object, which allows us to get form data
        // with the `body.get(key)` method
        text: request.body.get('text')
    });
    return response;
});
//# sourceMappingURL=index.json.js.map