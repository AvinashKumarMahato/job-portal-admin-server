import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DraftBlogPost = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const navigate = useNavigate();

  const openDeleteModal = (postId) => {
    setPostToDelete(postId);
    setShowModal(true);
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = Math.floor(seconds / 31536000);

    if (interval > 1) return `${interval} years ago`;
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return `${interval} months ago`;
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval} days ago`;
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `${interval} h ago`;
    interval = Math.floor(seconds / 60);
    if (interval > 1) return `${interval} min ago`;
    return `${Math.max(1, seconds)} sec ago`;
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setError(null);
        const response = await axios.get('http://localhost:3001/getBlogDrafts');

        // Sort posts by date (newest first)
        const sortedPosts = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setPosts(sortedPosts);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to fetch blog posts');
      }
    };

    fetchPosts();
  }, []);

  const handleEditBlogPost = (postId) => {
    navigate(`/dashboard/edit/${postId}`, { state: { from: 'blogs' } });
  };

  const closeDeleteModal = () => {
    setShowModal(false);
    setPostToDelete(null);
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;

    try {
      await axios.delete(`http://localhost:3001/deleteDraftBlog/${postToDelete}`);
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postToDelete));
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting the post:', error);
      alert('Failed to delete the post. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4">
      {error && <div className="text-red-500 text-center">{error}</div>}

      {posts.length === 0 ? (
        <div className="text-center text-gray-500 mt-4">
          No drafts saved
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div key={post._id} className="p-4 border rounded shadow-sm">
              <h3 className="text-xl font-semibold">{post.title}</h3>
              <p className="text-gray-600">{timeAgo(post.createdAt)}</p>
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={() => handleEditBlogPost(post._id)}
                  className="mr-2 bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => openDeleteModal(post._id)}
                  className="text-red-500 hover:text-red-700 font-semibold"
                >
                  Delete Post
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Are you sure you want to delete this post?</h3>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeDeleteModal}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftBlogPost;
