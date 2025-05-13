import { FormEvent, useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { getTextFromShareTarget } from "./lib/text-from-share-target";

function App() {
  const [text, setText] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [missing, setMissing] = useState<string[]>([]);
  const [accents, setAccents] = useState<boolean>(false);
  const [copyPopup, setCopyPopup] = useState<boolean>(false);
  const isBigScreen = useMediaQuery({ query: "(min-width: 500px)" });
  useEffect(() => {
    if (window.location.pathname === "/share-target") {
      setText(getTextFromShareTarget(window.location));
    }
  }, []);
  function handleConversion(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    setResult("Please wait...");
    fetch("https://account.lingdocs.com/dictionary/script-to-phonetics", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ text, accents }),
    }).then(res => res.json()).then(res => {
      if (res.ok) {
        // @ts-ignore
        setResult(res.results.phonetics);
        // @ts-ignore
        setMissing(res.results.missing);
      } else {
        // @ts-ignore
        alert(res.error);
      }
    }).catch((e) => {
      console.error(e);
      alert("Connection or server error");
      setResult("");
    });
  }
  function handleClear() {
    setResult("");
    setMissing([]);
    setText("");
  }
  function handleCopy() {
    navigator.clipboard.writeText(result);
    setCopyPopup(true);
    setTimeout(() => {
        setCopyPopup(false);
    }, 1250);
  }
  function handlePaste() {
    navigator.clipboard.readText()
      .then(text => setText(prev => prev + text))
      .catch(console.error);
  }
  return (
    <div className="container py-3" style={{ maxWidth: "45rem" }}>
      <h2 className="mb-4">Pashto Script to Phonetics Converter</h2>
      <form onSubmit={handleConversion}>
        <div className="form-group mb-2">
          <label htmlFor="pashto-text">Pashto Script</label>
          <textarea
            className="form-control"
            id="pashto-text"
            rows={6}
            value={text}
            onChange={e => setText(e.target.value)}
            dir="rtl"
            spellCheck="false"
            autoCapitalize="false"
            autoComplete="false"
            autoCorrect="false"
          />
        </div>
        <div className="d-flex flex-row justify-content-between align-items-center">
          <button type="submit" className="btn btn-primary" disabled={!text}>
            <i className="fa-solid fa-arrow-right-arrow-left"/> Convert
          </button>
          <div className="form-check">
            <input
              className="form-check-input small"
              type="checkbox"
              checked={accents}
              id="accents"
              onChange={e => setAccents(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="accents">
              incl{isBigScreen ? "ude" : "."} accents
            </label>
          </div>
          <div>
            {isBigScreen && <button type="button" onClick={handlePaste} className="btn btn-secondary me-2">
              <i className="fa-solid fa-paste"/> Paste
            </button>}
            <button type="button" className="btn btn-secondary" onClick={handleClear} disabled={!(text || result)}>
              <i className="fa-solid fa-delete-left"/> Clear
            </button>
          </div>
        </div>
      </form>

      <div className="mt-3">
        <label htmlFor="phonetics">Phonetics</label>
        <textarea
          className="form-control"
          id="phonetics"
          rows={6}
          value={result}
          onChange={e => setResult(e.target.value)}
          dir="ltr"
          spellCheck="false"
          autoCapitalize="false"
          autoComplete="false"
          autoCorrect="false"
        />
      </div>
      <div className="d-flex flex-row-reverse mt-2">
        <div>
          <button
            type="button"
            disabled={!result}
            className="btn btn-primary"
            style={{ minWidth: "6rem" }}
            onClick={handleCopy}
          >
            <i className="fa-regular fa-copy me-2" /> Copy
          </button>
        </div>
      </div>
      <div className="small my-3 mb-2">
        Words not found in the <a href="https://dictionary.lingdocs.com">LingDocs Pashto Dictionary</a> are <em>estimated</em> and surrounded by <span style={{ wordBreak: "keep-all" }}>?* ... *?</span>
      </div>
      <div>
        {missing.length > 0 && <>
          <h5>Missing Words</h5>
          <div className="d-flex flex-row flex-wrap">
            {missing.map((m) => <div key={m} className="me-2">
              {m}
            </div>)}
          </div>
        </>}
      </div>
      {copyPopup && <div className="alert alert-primary text-center" role="alert" style={{
            position: "fixed",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 9999999999999,
        }}>
          phonetics copied to clipboard
        </div>}
    </div>
  );
}

export default App;
