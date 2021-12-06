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
// PATCH /todos/:uid.json
export const patch = (request) => __awaiter(void 0, void 0, void 0, function* () {
    return api(request, `todos/${request.locals.userid}/${request.params.uid}`, {
        text: request.body.get('text'),
        done: request.body.has('done') ? !!request.body.get('done') : undefined
    });
});
// DELETE /todos/:uid.json
export const del = (request) => __awaiter(void 0, void 0, void 0, function* () {
    return api(request, `todos/${request.locals.userid}/${request.params.uid}`);
});
//# sourceMappingURL=%5Buid%5D.json.js.map