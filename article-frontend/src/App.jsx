import { useEffect, useState } from "react"

const STRAPI_URL = "http://localhost:1337"

function imageUrl(url) {
  if (!url) return ""
  return url.startsWith("http") ? url : `${STRAPI_URL}${url}`
}

function extractText(content) {
  if (!content) return ""
  return content
    .map(block =>
      block.children ? block.children.map(c => c.text).join("") : ""
    )
    .join("\n\n")
}

export default function App() {
  const [articles, setArticles] = useState([])
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadArticles()
  }, [])

  async function loadArticles() {
    const res = await fetch(
      `${STRAPI_URL}/api/articles?populate[cover]=true`
    )
    const json = await res.json()
    setArticles(json.data || [])
    setLoading(false)
  }

  async function loadArticleDetails(slug) {
    const res = await fetch(
      `${STRAPI_URL}/api/articles?filters[slug][$eq]=${slug}&populate=gallery`
    )

    const json = await res.json()

    if (json.data && json.data.length > 0) {
      setSelectedArticle(json.data[0])
    }
  }

  return (
    <div className="page">

      <header className="hero">
        <h1>Article Listing</h1>
        <p>Publizierte Artikel aus Strapi</p>
      </header>

      <main className="layout">

        {/* Artikelliste */}
        <section>
          <h2>Artikel</h2>

          {loading && <p>Lade Artikel...</p>}

          {!loading &&
            articles.map(article => {

              const cover = article.cover?.url

              return (
                <div
                  key={article.id}
                  className="card"
                  onClick={() => loadArticleDetails(article.slug)}
                >
                  {cover && (
                    <img
                      src={imageUrl(cover)}
                      className="card-image"
                      alt=""
                    />
                  )}

                  <div className="card-content">
                    <h3>{article.title}</h3>
                    <p>{article.excerpt}</p>
                  </div>
                </div>
              )
            })}
        </section>


        {/* Detailbereich */}
        <aside>
          <h2>Details</h2>

          {!selectedArticle && <p>Klicke links auf einen Artikel.</p>}

          {selectedArticle && (
            <div className="detail-card">

              <h3>{selectedArticle.title}</h3>

              <p className="detail-text">
                {extractText(selectedArticle.content)}
              </p>

              {selectedArticle.gallery && (
                <div className="gallery">
                  {selectedArticle.gallery.map(img => (
                    <img
                      key={img.id}
                      src={imageUrl(img.url)}
                      className="gallery-image"
                      alt=""
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>

      </main>
    </div>
  )
}