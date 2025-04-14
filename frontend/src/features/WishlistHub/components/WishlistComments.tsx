import { useState, useEffect } from 'react';
import { useAuth } from '../../../store/AuthContext';
import { fetchWithAuth } from '../../../utils/fetchWithAuth';
import Swal from 'sweetalert2';
import UpperPanel from '../../../components/ui/UpperPanel';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { useMediaQuery } from 'react-responsive';
import { useTranslation } from "react-i18next";

interface Comment {
  id: string;
  author: string;
  authorId: string;
  authorImg: string;
  text: string;
  timestamp: string;
}

type CommentProps = {
    wishlistId: string;
    wishlistName: string;
    onClickBack: () => void;
};

const WishlistComments = ( {wishlistId, wishlistName, onClickBack}: CommentProps ) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const currentUserId = user?.userId;
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [showSpinner, setShowSpinner] = useState(false);
    const [showCommentOptions, setShowCommentOptions] = useState<string>('');
    const isDesktop = useMediaQuery({ minWidth: 1200 });

    useEffect(() => {
        const fetchComments = async () => {
        setShowSpinner(true);
        try {
            const res = await fetchWithAuth(`wishlistHub/wishlistComments/${wishlistId}`, {
                method: 'GET',
                credentials: 'include',
            });

            const data = await res.json();

            if (data.success) {
                console.log('Fetched comments:', data.comments);
                setComments(data.comments);
            } else {
                console.error('Failed to fetch comments:', data.message);
            }

        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setShowSpinner(false);
        }
        };

        fetchComments();
    }, [wishlistId]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim() === '') return;

        console.log('New comment submitted:', newComment);
        
        const addNewComment = async () => {
            setShowSpinner(true);
            try {
                const res = await fetchWithAuth(`wishlistHub/addComment/${wishlistId}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text: newComment }),
                });

                const data = await res.json();

                if (data.success) {
                    console.log('Comment added:', data.comment);
                    setComments(prevComments => [data.comment, ...prevComments]);
                }
                else {
                    console.error('Failed to add comment:', data.message);
                }

                
            } catch (error) {
                console.error('Error adding comment:', error);
            } finally {
                setShowSpinner(false);
            }
        }

        addNewComment();
        setNewComment('');
    };

    const handleDelete = async (commentId: string) => {
        Swal.fire({
            title: t("app.swal.deleteComment.title"),
            text: t("app.swal.deleteComment.text"),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#8F84F2',
            cancelButtonColor: '#cfcfcf',
            confirmButtonText: t("app.swal.deleteComment.confirmButtonText"),
            cancelButtonText: t("app.swal.deleteComment.cancelButtonText"),
        }).then(async (result) => {
            if (result.isConfirmed) {
                setShowSpinner(true);
                try {
                    const res = await fetchWithAuth(`wishlistHub/deleteComment/${commentId}/${wishlistId}`, {
                        method: 'DELETE',
                        credentials: 'include',
                    });

                    const data = await res.json();

                    if (data.success) {
                        console.log('Comment deleted:', commentId);
                        setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
                    } else {
                        console.error('Failed to delete comment:', data.message);
                    }
                } catch (error) {
                    console.error('Error deleting comment:', error);
                } finally {
                    setShowSpinner(false);
                }
            }
        }
        );
    }
    
    if (isDesktop) {
      return (
      <>
        <div className="wishlist-comments-container mt-4">
          <h4>{t("wishlistHub.commentsFor", { wishlistName })}</h4>

          <div className="add-comment-form my-4">
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <textarea
                  className="form-control"
                  placeholder={t("wishlistHub.addCommentPlaceholder")}
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  maxLength={500}
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">
                {t("wishlistHub.postCommentButton")}
              </button>
            </form>
          </div>

          <div className="comments-list mb-4">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item card mb-2 position-relative">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <img
                      src={comment.authorImg}
                      alt={comment.author}
                      className="profile-picture-thumbnail-sm rounded-circle me-2"
                    />
                    <div>
                      <h6 className="mb-0">{comment.author}</h6>
                      <small className="text-muted">
                        {formatDate(comment.timestamp)}
                      </small>
                    </div>
                  </div>
                  <p className="card-text">{comment.text}</p>
                </div>

                {currentUserId === comment.authorId && (
                    <button
                        className="comment-action-btn position-absolute top-0 end-0 m-2 btn btn-sm bg-transparent border-0"
                        onClick={() => setShowCommentOptions(prev => prev === comment.id ? '' : comment.id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                        </svg>
                    </button>
                )}
                {showCommentOptions === comment.id && currentUserId === comment.authorId && (
                    <div className="comment-options position-absolute top-50 end-0 bg-white shadow-sm rounded p-2">
                        <button className="btn btn-link text-danger" onClick={() => handleDelete(comment.id)}>
                          {t("wishlistHub.deleteComment")}
                        </button>
                    </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <LoadingSpinner className={showSpinner ? "" : "hidden"} />
      </> 
      );
    }

    return (
      <div className="profile-container p-4">
        <UpperPanel
          name={t("wishlistHub.commentsFor", { wishlistName })}
          onClickBack={() => onClickBack()}
        />

        <div className="wishlist-comments-container mt-4">
          <h4>{t("wishlistHub.commentsFor", { wishlistName })}</h4>

          <div className="add-comment-form my-4">
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <textarea
                  className="form-control"
                  placeholder={t("wishlistHub.addCommentPlaceholder")}
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  maxLength={500}
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">
                {t("wishlistHub.postCommentButton")}
              </button>
            </form>
          </div>

          <div className="comments-list mb-4">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item card mb-2 position-relative">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <img
                      src={comment.authorImg}
                      alt={comment.author}
                      className="profile-picture-thumbnail-sm rounded-circle me-2"
                    />
                    <div>
                      <h6 className="mb-0">{comment.author}</h6>
                      <small className="text-muted">
                        {formatDate(comment.timestamp)}
                      </small>
                    </div>
                  </div>
                  <p className="card-text">{comment.text}</p>
                </div>

                {currentUserId === comment.authorId && (
                    <button
                        className="comment-action-btn position-absolute top-0 end-0 m-2 btn btn-sm bg-transparent border-0"
                        onClick={() => setShowCommentOptions(prev => prev === comment.id ? '' : comment.id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                        </svg>
                    </button>
                )}
                {showCommentOptions === comment.id && currentUserId === comment.authorId && (
                    <div className="comment-options position-absolute top-50 end-0 bg-white shadow-sm rounded p-2">
                        <button className="btn btn-link text-danger" onClick={() => handleDelete(comment.id)}>
                          {t("wishlistHub.deleteComment")}
                        </button>
                    </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <LoadingSpinner className={showSpinner ? "" : "hidden"} />
      </div>
    );
};

export default WishlistComments;
