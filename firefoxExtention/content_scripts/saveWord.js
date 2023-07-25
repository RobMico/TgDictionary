try {
    let buttonPanel = document.getElementsByTagName('c-wiz')[3].children[0].children[0];
    let pannel = buttonPanel.children[1];
    let btn = pannel.children[0];
    console.log(btn.classList);

    let container = document.createElement("div");
    container.className = pannel.className;

    let mybtn = document.createElement("button");
    mybtn.classList = btn.classList;
    mybtn.innerText = 'Save';
    mybtn.onclick = saveWord;
    container.appendChild(mybtn);

    buttonPanel.append(container);



    async function saveWord() {
        let word = document.getElementsByTagName('c-wiz')[8].children[1];
        let wordText = word.querySelectorAll('textarea')[0];
        let RESULT_WORD = wordText.value;

        let translate = document.getElementsByTagName('c-wiz')[11];
        let translateSpan = translate.querySelectorAll('span>span>span')[0];
        let RESULT_TRANSLATE = translateSpan.innerText;

        let RESULT_DESCRIPTION;
        try {
            let description = document.getElementsByTagName('c-wiz')[12];
            let tmp = description.querySelectorAll('div>div>div>div>div>div>div>div')[1];
            RESULT_DESCRIPTION = tmp.innerText;
        } catch (ex) {

        }

        try {
            
            let { apiHash } = (await browser.storage.local.get('apiHash')) || {};
            let { saveWordLink } = (await browser.storage.local.get('saveWordLink')) || {};
            if (!apiHash || !saveWordLink) {
                return alert('Api hash or server link was not provided');
            }

            let res = await fetch(saveWordLink, {
                method: "POST",
                
                body: JSON.stringify({
                    original: RESULT_WORD,
                    translate: RESULT_TRANSLATE,
                    desription: RESULT_DESCRIPTION
                }),
                headers: {
                    "Content-Type": "application/json",
                    'accessHash': apiHash
                }
            });
            
            if (res.ok) {
                mybtn.innerText = "Ok";
                setTimeout(() => {
                    mybtn.innerText = "Save";
                }, 1000);
            } else {
                mybtn.innerText = "Failed";
                setTimeout(() => {
                    mybtn.innerText = "Save";
                }, 1000);
            }
        } catch (ex) {
            console.log(ex);
        }
    }

} catch (ex) {
    console.error(ex);
}