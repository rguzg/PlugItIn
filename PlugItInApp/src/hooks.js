var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import cookie from 'cookie';
import { v4 as uuid } from '@lukeed/uuid';
export const handle = ({ request, resolve }) => __awaiter(void 0, void 0, void 0, function* () {
    const cookies = cookie.parse(request.headers.cookie || '');
    request.locals.userid = cookies.userid || uuid();
    // TODO https://github.com/sveltejs/kit/issues/1046
    if (request.query.has('_method')) {
        request.method = request.query.get('_method').toUpperCase();
    }
    const response = yield resolve(request);
    if (!cookies.userid) {
        // if this is the first time the user has visited this app,
        // set a cookie so that we recognise them when they return
        response.headers['set-cookie'] = cookie.serialize('userid', request.locals.userid, {
            path: '/',
            httpOnly: true
        });
    }
    return response;
});
//# sourceMappingURL=hooks.js.map