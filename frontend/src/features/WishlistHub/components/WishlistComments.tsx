import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../utils/fetchWithAuth';
import UpperPanel from '../../../components/ui/UpperPanel';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

interface Comment {
  id: string;
  author: string;
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
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showSpinner, setShowSpinner] = useState(false);

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
    
    setNewComment('');
  };

  return (
    <div className="profile-container p-4">
        <UpperPanel name="Wishlist Comments" onClickBack={() => onClickBack()}/>
        <div className="wishlist-comments-container mt-4">
        <h4>Comments for {wishlistName}</h4>

        <div className="add-comment-form my-4">
            <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
                <textarea 
                className="form-control" 
                placeholder="Add a comment..." 
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                ></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Post Comment</button>
            </form>
        </div>
        
        <div className="comments-list mb-4">
            {comments.map(comment => (
            <div key={comment.id} className="comment-item card mb-2">
                <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                    <img 
                    src={comment.authorImg} 
                    alt={comment.author} 
                    className="profile-picture-thumbnail-sm rounded-circle me-2"
                    />
                    <div>
                    <h6 className="mb-0">{comment.author}</h6>
                    <small className="text-muted">{formatDate(comment.timestamp)}</small>
                    </div>
                </div>
                <p className="card-text">{comment.text}</p>
                </div>
            </div>
            ))}
        </div>

        </div>
        <LoadingSpinner className={showSpinner ? "" : "hidden"} />
    </div>
  );
};

export default WishlistComments;
