var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// this action (https://svelte.dev/tutorial/actions) allows us to
// progressively enhance a <form> that already works without JS
export function enhance(form, { pending, error, result }) {
    let current_token;
    function handle_submit(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = (current_token = {});
            e.preventDefault();
            const body = new FormData(form);
            if (pending)
                pending(body, form);
            try {
                const res = yield fetch(form.action, {
                    method: form.method,
                    headers: {
                        accept: 'application/json'
                    },
                    body
                });
                if (token !== current_token)
                    return;
                if (res.ok) {
                    result(res, form);
                }
                else if (error) {
                    error(res, null, form);
                }
                else {
                    console.error(yield res.text());
                }
            }
            catch (e) {
                if (error) {
                    error(null, e, form);
                }
                else {
                    throw e;
                }
            }
        });
    }
    form.addEventListener('submit', handle_submit);
    return {
        destroy() {
            form.removeEventListener('submit', handle_submit);
        }
    };
}
//# sourceMappingURL=form.js.map