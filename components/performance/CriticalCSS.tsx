// Critical CSS component for above-the-fold content
export function CriticalCSS() {
  return (
    <style jsx>{`
      /* Critical path CSS for initial render */
      .header-critical {
        background-color: white;
        border-bottom: 1px solid #e5e7eb;
        position: sticky;
        top: 0;
        z-index: 50;
      }
      
      .hero-critical {
        background: linear-gradient(to bottom, #eff6ff, white);
        padding: 4rem 1rem;
      }
      
      .search-critical {
        max-width: 32rem;
        margin: 0 auto;
      }
      
      /* Prevent layout shift */
      .drug-card-skeleton {
        height: 200px;
        background-color: #f9fafb;
        border-radius: 0.5rem;
        border: 1px solid #e5e7eb;
      }
    `}</style>
  )
}