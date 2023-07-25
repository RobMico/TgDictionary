let start = async () => {
    const saveWordLink = 'http://localhost:7738/saveWord';
    const checkHashLink = 'http://localhost:7738/checkHash';
    browser.storage.local.set({ 'saveWordLink': saveWordLink });
    browser.storage.local.set({ 'checkHashLink': checkHashLink });

    let q = document.getElementById('container');
    try {
        let hash = await browser.storage.local.get('apiHash');
        if (!hash || Object.keys(hash).length == 0 || !hash.apiHash) {

            let div = document.createElement("div");
            let span = document.createElement("span");
            span.innerText = "Your access hash:";
            div.appendChild(span);
            let input = document.createElement("input");
            div.appendChild(input);
            let button = document.createElement("button");
            div.appendChild(button);
            button.innerText = "Ok";
            button.onclick = async () => {

                let hash = input.value;
                let { checkHashLink } = await browser.storage.local.get('checkHashLink');

                let res = await fetch(checkHashLink, {
                    method: "POST",
                    timeout: 1,
                    headers: {
                        "Content-Type": "application/json",
                        'accessHash': hash
                    }
                });

                let data = await res.json();

                if (data.data) {
                    await browser.storage.local.set({ 'username': data.data.name });
                }

                if (res.ok && data.ok) {
                    await browser.storage.local.set({ 'apiHash': hash });
                    q.innerHTML = "Ok";
                } else {
                    q.innerHTML = "Error";
                }
            }
            q.appendChild(div);
            return;
        }

        let { username } = await browser.storage.local.get('username');
        if (username) {
            let span = document.createElement("span");
            span.innerText = `Hello ${username}!~`;
            q.appendChild(span);
        }

        let button = document.createElement("button");
        button.innerText = "Change hash";
        q.appendChild(button);
        button.onclick = async () => {
            await browser.storage.local.set({ 'apiHash': null });
            q.innerHTML = '';
            start();
        }

        return;
    } catch (ex) {
        q.innerText = ex.message;
    }
}

start();

