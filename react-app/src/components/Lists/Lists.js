import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import { getAnimesByUserThunk } from "../../store/anime";
import { getListsThunk } from "../../store/lists";
import { getUserThunk } from "../../store/session";
import ListModal from "../ListModal";
import styles from "./Lists.module.css";
import NewListModal from "../NewListModal";

export default function Lists() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { userId } = useParams();
  const user = useSelector((state) => state.session.user);
  const listsArr = useSelector((state) => state.lists.lists);
  const animeArr = useSelector((state) => state.anime.animeByUser?.animes);
  const getUser = useSelector((state) => state.session?.get_user);
  const [animes, setAnimes] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(getListsThunk(userId)).then(() => {
        setIsLoaded(true);
      });
      dispatch(getAnimesByUserThunk(userId));
      dispatch(getUserThunk(userId));
    }
  }, [dispatch, user, userId, animes, hasClicked]);

  if (!isLoaded) {
    return null;
  }

  if (!listsArr) {
    return (
      <div>
        <h1>There are no lists here!</h1>
      </div>
    );
  }

  if (!animeArr) {
    return (
      <div>
        <h1>There are no anime here!</h1>
      </div>
    );
  }

  if (!animes) setAnimes(animeArr);

  if (!getUser) {
    return null;
  }

  const showAnime = (list) => {
    if (list) setAnimes(list);
    else setAnimes(animeArr);
  };

  const animeDetails = (mal_id) => {
    history.push(`/anime/${mal_id}`);
  };

  return (
    <div>
      <div className={styles.list_header}>
        <h1>{getUser.username}'s Lists</h1>
        <NewListModal hasClicked={hasClicked} setHasClicked={setHasClicked} />
      </div>
      <div className={styles.lists}>
        <div className={styles.list_name} onClick={() => showAnime()}>
          All Anime
        </div>
        {listsArr.map((list) => {
          return (
            <div key={`list-${list.id}`} className={styles.list_name}>
              <div
                onClick={() => {
                  showAnime(list);
                }}
                className={styles.listName}
              >
                {list.name}
                {list.private && <i className="fas fa-lock"></i>}
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles.animes}>
        <div className={styles.list_edit}>
          {!animes.name && <h2>All Anime</h2>}
          {animes.name && <h2>{animes.name}</h2>}
          {animes.name && user.id === Number(userId) && (
            <ListModal
              list={animes}
              setAnimes={setAnimes}
              setHasClicked={setHasClicked}
              hasClicked={hasClicked}
            />
          )}
        </div>
        <div>
          {animes &&
            !animes.name &&
            animes.map((anime) => {
              return (
                <div
                  key={`anime-${anime.id}`}
                  onClick={() => animeDetails(anime.mal_id)}
                >
                  {anime.title}
                </div>
              );
            })}
          {animes?.anime &&
            animes?.anime.map((anime) => {
              return (
                <div
                  key={`anime-${anime.id}`}
                  className={styles.anime}
                  onClick={() => animeDetails(anime.id)}
                >
                  <div>{anime.title}</div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
