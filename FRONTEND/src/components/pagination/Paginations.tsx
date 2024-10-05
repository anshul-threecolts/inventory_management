import React, { useEffect, useState } from "react";
import "./Pagination.scss";
import { ChevronRight, ChevronLeft } from "react-bootstrap-icons";
import { Pagination } from 'react-bootstrap'

interface PaginationProps {
  totalItems?: number;
  itemsCountPerPage?: number;
  className?: string;
  changePage: any;
  changeCurrentPage?: any;
}

const Paginations = (props: PaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(0);
  const [pages, setPages] = useState<Number[]>([]);

  useEffect(() => {
    setCurrentPage(props.changeCurrentPage)
  }, [props.changeCurrentPage])

  useEffect(() => {
    var totalItems: number = props.totalItems ? props.totalItems : Number(10);
    var itemsCountPerPage: number = props.itemsCountPerPage ? props.itemsCountPerPage : Number(10);
    const totalPage = Math.ceil(totalItems / itemsCountPerPage);
    setLastPage(totalPage);
    var temp = [];
    let startPage, endPage;
    if (totalPage <= 5) {
      startPage = 1;
      endPage = totalPage;
    } else {
      if (currentPage <= 3) {
        startPage = 1;
        endPage = 5;
      } else if (currentPage + 2 >= totalPage) {
        startPage = totalPage - 4;
        endPage = totalPage;
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
      }
    }
    for (let i = startPage; i <= endPage; i++) {
      temp.push(i);
    }
    setPages(temp);
  }, [currentPage, props.totalItems]);

  const changepage = (page: number) => {
    setCurrentPage(page);
    props.changePage(page);
  };

  const nextchangepage = () => {
    setCurrentPage(currentPage + 1);
    props.changePage(currentPage + 1);
  };

  const previouschangepage = () => {
    setCurrentPage(currentPage - 1);
    props.changePage(currentPage - 1);
  };

  return (
    <>
      <div className="pagination-control">
        <Pagination>
          {/* <Pagination.First /> */}
          <Pagination.Prev onClick={() => previouschangepage()} disabled={currentPage == 1} />
          {pages.map((page: any, index: number) => {
            return (
              <Pagination.Item active={currentPage == page} onClick={() => changepage(page)}>{page}</Pagination.Item>
            )
          })}
          <Pagination.Next onClick={() => nextchangepage()} disabled={currentPage == lastPage} />
          {/* <Pagination.Last /> */}
        </Pagination>
      </div>
    </>
  );
};

export default Paginations;
