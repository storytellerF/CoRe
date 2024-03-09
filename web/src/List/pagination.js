import React from "react";
import { Pagination, PaginationItem, PaginationLink } from "reactstrap";

const Paginations = ({ currentPage, totalPages, onChangePage }) => {
    // 生成页码按钮
    const pageButtons = [];
    for (let i = 1; i <= totalPages; i++) {
        pageButtons.push(
            <PaginationItem
                className={currentPage === i ? "active" : ""}
                key={i}
                onClick={() => onChangePage(i)}
            >
                <PaginationLink href="#">{i}</PaginationLink>
            </PaginationItem>,
        );
    }

    return (
        <Pagination size="sm" style={{ marginTop: "20px" }}>
            {pageButtons}
        </Pagination>
    );
};

export default Paginations;
