import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Camera, Image as ImageIcon, Trash2, ShieldAlert, Sparkles, UploadCloud } from 'lucide-react';

export default function PhotoUploader({ jobId, userId }) {
  const [photos, setPhotos] = useState([]);
  const [description, setDescription] = useState('');
  const [photoType, setPhotoType] = useState('progress');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jobId) {
      fetchPhotos();
    }
  }, [jobId]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_photos')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (err) {
      console.error('Error fetching photos:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      let finalPhotoUrl = '';
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${jobId}/${Date.now()}.${fileExt}`;
      const filePath = `photos/${fileName}`;

      // 1. Attempt upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('job-photos')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (!uploadError && data) {
        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('job-photos')
          .getPublicUrl(filePath);
        finalPhotoUrl = publicUrl;
      } else {
        console.warn('Storage upload error, falling back to base64 encoding:', uploadError?.message);
        
        // 2. Base64 fallback (guarantees the app works perfectly in local / dev modes)
        finalPhotoUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(selectedFile);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (err) => reject(err);
        });
      }

      // 3. Save DB Record
      const { data: insertedData, error: dbError } = await supabase
        .from('job_photos')
        .insert({
          job_id: jobId,
          photo_type: photoType,
          photo_url: finalPhotoUrl,
          description: description.trim(),
          uploaded_by: userId
        })
        .select();

      if (dbError) throw dbError;

      setPhotos(prev => [insertedData[0], ...prev]);
      setSelectedFile(null);
      setDescription('');
      // Reset input element
      e.target.reset();
    } catch (err) {
      alert('Error uploading photo: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photo) => {
    try {
      // 1. Delete DB record
      const { error: dbError } = await supabase
        .from('job_photos')
        .delete()
        .eq('id', photo.id);

      if (dbError) throw dbError;

      // 2. Attempt deleting from storage bucket if it's a supabase storage link
      if (photo.photo_url.includes('supabase.co')) {
        const filePath = photo.photo_url.split('/public/job-photos/')[1];
        if (filePath) {
          await supabase.storage.from('job-photos').remove([filePath]);
        }
      }

      setPhotos(prev => prev.filter(p => p.id !== photo.id));
    } catch (err) {
      alert('Error deleting photo: ' + err.message);
    }
  };

  return (
    <div>
      {/* Upload Form */}
      <form onSubmit={handleUpload} className="card dashboard-card" style={{ marginBottom: 32, padding: 20 }}>
        <h4 style={{ fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignCenter: 'center', gap: 8 }}>
          <Camera size={18} style={{ color: 'var(--color-primary-light)' }} /> Upload Job Photo
        </h4>
        
        <div className="grid grid-3" style={{ gap: 16, marginBottom: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Photo Type</label>
            <select 
              value={photoType} 
              onChange={(e) => setPhotoType(e.target.value)} 
              className="form-input" 
              style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: 'white' }}
            >
              <option value="damage">⚠️ Pre-Existing Damage</option>
              <option value="progress">⏳ In-Progress Update</option>
              <option value="completed">✅ Completion Record</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
            <label className="form-label">Description / Notes</label>
            <input 
              type="text" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="e.g. Broken tile under counter OR Living room vacuum complete" 
              className="form-input"
              style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: 'white' }}
              required
            />
          </div>
        </div>

        <div className="flex justify-between align-center" style={{ gap: 16 }}>
          <div style={{ position: 'relative', flexGrow: 1 }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              id="file-upload-input"
              style={{ display: 'none' }}
              required
            />
            <label 
              htmlFor="file-upload-input"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 8,
                padding: '12px',
                borderRadius: 'var(--radius)',
                border: '2px dashed #334155',
                cursor: 'pointer',
                color: selectedFile ? '#2dd4bf' : '#94a3b8',
                backgroundColor: '#0f172a',
                transition: 'var(--transition)'
              }}
            >
              <UploadCloud size={20} />
              {selectedFile ? `Selected: ${selectedFile.name}` : 'Click to select photo / snap picture'}
            </label>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={uploading || !selectedFile}
            style={{ padding: '12px 28px', flexShrink: 0 }}
          >
            {uploading ? 'Uploading...' : 'Save Photo'}
          </button>
        </div>
      </form>

      {/* Photo Stream */}
      {loading ? (
        <div style={{ color: '#94a3b8' }}>Loading photo stream...</div>
      ) : photos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed #334155', borderRadius: 'var(--radius)', color: '#64748b' }}>
          <ImageIcon size={32} style={{ marginBottom: 12 }} />
          <p>No photos uploaded for this job yet.</p>
        </div>
      ) : (
        <div className="grid grid-3" style={{ gap: 20 }}>
          {photos.map(photo => (
            <div 
              key={photo.id} 
              className="card dashboard-card" 
              style={{ padding: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', paddingBottom: '75%', backgroundColor: '#0f172a' }}>
                <img 
                  src={photo.photo_url} 
                  alt={photo.description}
                  style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', top: 0, left: 0 }}
                />
                <span 
                  className={`badge badge-${photo.photo_type === 'damage' ? 'unpaid' : photo.photo_type === 'completed' ? 'completed' : 'progress'}`}
                  style={{ position: 'absolute', top: 10, left: 10, fontSize: '0.65rem' }}
                >
                  {photo.photo_type}
                </span>
              </div>

              <div style={{ padding: '12px 4px 4px 4px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '0.85rem', color: '#f8fafc', marginBottom: 12 }}>{photo.description}</p>
                <div className="flex justify-between align-center" style={{ marginTop: 'auto' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {new Date(photo.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button 
                    onClick={() => handleDeletePhoto(photo)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
