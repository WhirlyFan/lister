import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getAnimeThunk } from "../../store/jikan";
import { getMalAnimeThunk } from "../../store/anime";
import { getAnimeReviewsThunk } from "../../store/reviews";
import styles from "./AnimeDetails.module.css";
import ReviewModal from "../ReviewModal";
import AddReviewModal from "../AddReviewModal";

export default function AnimeDetails() {
  const dispatch = useDispatch();
  const { malAnimeId } = useParams();
  const anime = useSelector((state) => state.anime.anime);
  const malAnime = useSelector((state) => state.jikan.anime.data);
  const user = useSelector((state) => state.session.user);
  const [isLoaded, setIsLoaded] = useState(false);
  const [reviews, setReviews] = useState(null);
  const [hasClicked, setHasClicked] = useState(false);

  useEffect(() => {
    dispatch(getAnimeThunk(malAnimeId)).then((anime) => {
      setIsLoaded(true);
    });
    dispatch(getMalAnimeThunk(malAnimeId)).then((anime) => {
      if (anime.status) {
      } else {
        dispatch(getAnimeReviewsThunk(anime.id)).then((reviews) => {
          setReviews(reviews.reviews);
        });
      }
    });
  }, [dispatch, malAnimeId]);

  if (!anime || !malAnime || !isLoaded) {
    return null;
  }

  return (
    <div>
      <h1>{malAnime.title}</h1>
      <div>
        <img src={malAnime.images.jpg.image_url} alt="anime poster" />
      </div>
      <div>
        <h2>Synopsis</h2>
        <p>{malAnime.synopsis}</p>
      </div>
      <div>
        <div className={styles.review_header}>
          <h2>Reviews</h2>
          <AddReviewModal
            hasClicked={hasClicked}
            setHasClicked={setHasClicked}
          />
        </div>
        <ul>
          {!reviews && <li>No reviews yet!</li>}
          {reviews &&
            reviews.map((review) => {
              return (
                <li key={`review-${review.id}`} className={styles.review}>
                  <div className={styles.review_info}>
                    <div>{review.user.username}</div>
                    <div>★{review.rating}</div>
                  </div>
                  <div>{review.review}</div>
                  {user && user.id === review.user_id && (
                    <div>
                      <ReviewModal
                        review={review}
                        hasClicked={hasClicked}
                        setHasClicked={setHasClicked}
                      />
                    </div>
                  )}
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
}
