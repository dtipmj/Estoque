import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "../../styles/pagination.css";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const goTo = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      Math.abs(i - currentPage) <= 1
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="pagination">
      <button
        type="button"
        className="pagination-btn pagination-arrow"
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <FiChevronLeft />
      </button>

      {pages.map((p, idx) =>
        p === "..." ? (
          <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
            ...
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={
              "pagination-btn" +
              (p === currentPage ? " pagination-btn-active" : "")
            }
            onClick={() => goTo(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        className="pagination-btn pagination-arrow"
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <FiChevronRight />
      </button>
    </div>
  );
}
