import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { getTopAnimeThunk } from "../../store/jikan";
import styles from "./TopAnime.module.css";
import AnimeCard from "../Home/AnimeCard";

export default function Lists() {
  const dispatch = useDispatch();
  const history = useHistory();
  const user = useSelector((state) => state.session.user);
  const [isLoaded, setIsLoaded] = useState(false);
  const [topAnime, setTopAnime] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const [delay, setDelay] = useState(false);
  const top = true;

  useEffect(() => {
    dispatch(getTopAnimeThunk(page))
      .then((data) => {
        if (data.status) {
          setTimeout(() => {
            setDelay(!delay);
          }, 1000); //delay used because of API rate limit
        } else {
          setTopAnime(data.data);
        }
      })
      .then(() => {
        setIsLoaded(true);
      });
  }, [dispatch, page, pagination, delay]);

  if (!isLoaded || !topAnime) {
    return (
      <div>
        <h1>LOADING...</h1>
      </div>
    );
  }

  const animeDetails = (id) => {
    history.push(`/anime/${id}`);
  };

  return (
    <div className={styles.top_anime}>
      <h2>Top Anime</h2>
      <div className={styles.pagination}>
        <div className={styles.current_page}>
          <div>Page: {page}</div>
        </div>
        <div className={styles.page_list}>
          {pagination[0] > 10 ? (
            <div
              key={`page-${page}`}
              onClick={() =>
                setPagination(
                  pagination.map((page) => {
                    return page - 10;
                  })
                )
              }
            >
              {"<"}
            </div>
          ) : null}
          {pagination.map((page) => {
            return (
              <div key={`page-${page}`} onClick={() => setPage(page)}>
                {page}
              </div>
            );
          })}
          <div>
            {pagination[0] < 40 ? (
              <div
                onClick={() =>
                  setPagination(
                    pagination.map((page) => {
                      return page + 10;
                    })
                  )
                }
              >
                {">"}
              </div>
            ) : null}
          </div>
        </div>
        {/* <button onClick={() => setPage(page <= 1 ? 1 : page - 1)}>
          Previous
        </button>
        <button onClick={() => setPage(page >= 50 ? 10 : page + 1)}>
          Next
        </button> */}
      </div>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Image</th>
            <th>Title</th>
            <th>Score</th>
            {user && <th>Add to List</th>}
          </tr>
        </thead>
        <tbody>
          {topAnime.map((anime, index) => (
            <AnimeCard
              key={`anime-${anime.mal_id}`}
              anime={anime}
              index={index}
              top={top}
              onClick={() => animeDetails(anime.mal_id)}
            />
          ))}
        </tbody>
      </table>
      <div className={styles.pagination}>
        <div className={styles.page_list}>
          {pagination[0] > 10 ? (
            <div
              key={`page-${page}`}
              onClick={() =>
                setPagination(
                  pagination.map((page) => {
                    return page - 10;
                  })
                )
              }
            >
              {"<"}
            </div>
          ) : null}
          {pagination.map((page) => {
            return (
              <div key={`page-${page}`} onClick={() => setPage(page)}>
                {page}
              </div>
            );
          })}
          <div>
            {pagination[0] < 40 ? (
              <div
                onClick={() =>
                  setPagination(
                    pagination.map((page) => {
                      return page + 10;
                    })
                  )
                }
              >
                {">"}
              </div>
            ) : null}
          </div>
        </div>
        {/* <button onClick={() => setPage(page <= 1 ? 1 : page - 1)}>
          Previous
        </button>
        <button onClick={() => setPage(page >= 50 ? 10 : page + 1)}>
          Next
        </button> */}
        <div className={styles.current_page}>
          <div>Page: {page}</div>
        </div>
      </div>
    </div>
  );
}
