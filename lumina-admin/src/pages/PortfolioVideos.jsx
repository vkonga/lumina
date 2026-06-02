import React, { useState, useEffect } from 'react';
import client from '../api/client';

const PortfolioVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Create Form State
  const [newVideo, setNewVideo] = useState({
    title: '',
    url: ''
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState('');


  const fetchVideos = async () => {
    try {
      const response = await client.get('/admin/portfolio-videos');
      if (response.success) {
        setVideos(response.data);
      } else {
        setError(response.message || 'Failed to load portfolio videos.');
      }
    } catch (err) {
      setError('An unexpected error occurred reading portfolio videos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Helper to extract YouTube video ID and format into standard embed URL
  const getEmbedUrl = (url) => {
    if (!url) return '';
    let videoId = '';
    
    // Parse watch format: youtube.com/watch?v=ID
    if (url.includes('youtube.com/watch')) {
      const parts = url.split('v=');
      if (parts.length > 1) {
        videoId = parts[1].split('&')[0];
      }
    } 
    // Parse short format: youtu.be/ID
    else if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/');
      if (parts.length > 1) {
        videoId = parts[1].split('?')[0];
      }
    }
    // Parse embed format: youtube.com/embed/ID
    else if (url.includes('youtube.com/embed/')) {
      const parts = url.split('youtube.com/embed/');
      if (parts.length > 1) {
        videoId = parts[1].split('?')[0];
      }
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVideo((prev) => ({
      ...prev,
      [name]: value
    }));
  };


  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newVideo.title || !newVideo.url) {
      setError('Title and YouTube URL are required.');
      return;
    }

    setAddLoading(true);
    setError('');
    setAddSuccess('');

    // Format embed URL before saving
    const formattedUrl = getEmbedUrl(newVideo.url);

    try {
      const response = await client.post('/admin/portfolio-videos', {
        title: newVideo.title,
        url: formattedUrl
      });

      if (response.success) {
        setAddSuccess('Video added to portfolio successfully!');
        setNewVideo({ title: '', url: '' });
        setVideos((prev) => [...prev, response.data.video]);
        setTimeout(() => setAddSuccess(''), 4000);
      } else {
        setError(response.message || 'Failed to add portfolio video.');
      }
    } catch (err) {
      setError('An error occurred during addition.');
    } finally {
      setAddLoading(false);
    }
  };


  const handleDeleteVideo = async (id) => {
    if (!window.confirm('Are you sure you want to remove this video from the portfolio?')) return;
    
    setError('');
    try {
      const response = await client.delete(`/admin/portfolio-videos/${id}`);
      if (response.success) {
        setVideos(prev => prev.filter(v => v.id !== id));
      } else {
        setError(response.message || 'Failed to delete video.');
      }
    } catch (err) {
      setError('An error occurred while deleting.');
    }
  };

  return (
    <div className="admin-page-container">
      <header className="admin-page-header">
        <div>
          <h1>Portfolio Video Integration</h1>
          <p className="subtitle">Embed YouTube teasers, showreel highlights, and wedding cinematic summaries into the client portfolio gallery.</p>
        </div>
      </header>

      {addSuccess && <div className="admin-success-banner">{addSuccess}</div>}
      {error && <div className="admin-error-banner">{error}</div>}

      <div className="order-detail-grid">
        {/* Left Side: Create Form */}
        <div className="detail-col-sidebar" style={{ gap: '25px' }}>
          <div className="detail-card">
            <h3>Add YouTube Showcase</h3>
            <form onSubmit={handleAddSubmit} className="status-update-form">
              <div className="form-group">
                <label>Video Title *</label>
                <input
                  type="text"
                  name="title"
                  value={newVideo.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Royal Jaipur Wedding Teaser"
                  required
                />
              </div>

              <div className="form-group">
                <label>YouTube Video URL *</label>
                <input
                  type="url"
                  name="url"
                  value={newVideo.url}
                  onChange={handleInputChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={addLoading}>
                {addLoading ? 'Saving...' : 'Add to Portfolio'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Showcase Grid list */}
        <div className="detail-col-main">
          <div className="detail-card" style={{ height: '100%' }}>
            <h3>Active Portfolio Videos ({videos.length})</h3>
            
            {loading ? (
              <div className="admin-page-loading" style={{ minHeight: '30vh' }}>
                <div className="admin-spinner"></div>
                <span>Loading video list...</span>
              </div>
            ) : videos.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No showreel videos added yet. Enter a YouTube URL on the left to show highlights.</p>
            ) : (
              <div className="products-admin-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {videos.map((video) => (
                  <div key={video.id} className="product-admin-card" style={{ border: '1px solid #1a1a1a', background: '#090909' }}>
                    <div style={{ height: '180px', position: 'relative' }}>
                      <iframe
                        src={video.url}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ width: '100%', height: '100%', border: 'none' }}
                      ></iframe>
                    </div>

                    <div className="product-card-body" style={{ padding: '15px 20px 20px 20px' }}>
                      <h4 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: '#fff', fontWeight: '600' }}>{video.title}</h4>
                      
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          className="table-action-btn" 
                          style={{ flex: '1', textAlign: 'center', borderColor: 'rgba(220, 53, 69, 0.3)', color: '#ff6b6b' }}
                          onClick={() => handleDeleteVideo(video.id)}
                        >
                          Delete Video
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default PortfolioVideos;
