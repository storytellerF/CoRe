import { useEffect, useRef, useState } from "react";

function Index() {
  const h1 = useRef()
  const div = useRef()

  useEffect(() => {
    let timer = setTimeout(() => {
      const w = h1.current.clientWidth
      let n
      if (w >= 400) n =  400 
      else n = w
      div.current.setAttribute("data-width", n)
      const t = document.getElementsByClassName("github-card")[0]
      if (t) {
        window.githubCard.render(t)
      }
    }, 500);
    return () => {
      clearTimeout(timer)
    }
  }, [])
  return (
    <div className="container mt-4 p-5 bg-light rounded" style={{ marginTop: "20px" }} >
      <h1 ref={h1}>核</h1>

      <div className="github-card" data-github="storytellerF/CoRe" ref={div} data-height="150" data-theme="default"></div>
    </div>
  );
}

export default Index;
