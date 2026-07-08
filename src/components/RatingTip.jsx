import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Star, DollarSign, CheckCircle2 } from 'lucide-react';

export default function RatingTip({ job, clientId }) {
  const [existing, setExisting] = useState(null);
  const [stars, setStars] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [review, setReview] = useState('');
  const [tipAmount, setTipAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    checkExisting();
  }, [job.id]);

  const checkExisting = async () => {
    const { data } = await supabase
      .from('ratings')
      .select('*')
      .eq('job_id', job.id)
      .eq('client_id', clientId)
      .maybeSingle();
    if (data) {
      setExisting(data);
      setStars(data.stars);
      setReview(data.review_text || '');
      setTipAmount(data.tip_amount || 0);
      setSubmitted(true);
    }
  };

  const handleSubmit = async () => {
    if (stars === 0) {
      alert('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    try {
      const tip = parseFloat(tipAmount) || 0;
      const { error } = await supabase.from('ratings').upsert({
        job_id: job.id,
        client_id: clientId,
        employee_id: job.employee_id || null,
        stars,
        review_text: review || null,
        tip_amount: tip,
        tip_paid: false
      }, { onConflict: 'job_id,client_id' });
      if (error) throw error;
      setSubmitted(true);
      setExisting({ stars, review_text: review, tip_amount: tip });
    } catch (err) {
      alert('Error submitting rating: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted && existing) {
    return (
      <div style={{ backgroundColor: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <CheckCircle2 size={18} style={{ color: '#10b981' }} />
          <span style={{ color: '#10b981', fontWeight: 600 }}>Review Submitted</span>
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} size={16} fill={s <= existing.stars ? '#f59e0b' : 'none'} stroke="#f59e0b" />
          ))}
        </div>
        {existing.review_text && <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 4 }}>"{existing.review_text}"</p>}
        {existing.tip_amount > 0 && (
          <p style={{ color: '#f59e0b', fontSize: '0.85rem', fontWeight: 600 }}>
            💛 Tip: ${parseFloat(existing.tip_amount).toFixed(2)} — Thank you!
          </p>
        )}
      </div>
    );
  }

  if (job.status !== 'completed') {
    return (
      <p style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>
        Rating available after job is completed.
      </p>
    );
  }

  return (
    <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12, padding: 20 }}>
      <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: 16 }}>Rate Your Cleaning & Leave a Tip</h4>

      {/* Star Rating */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            type="button"
            onClick={() => setStars(s)}
            onMouseEnter={() => setHoverStar(s)}
            onMouseLeave={() => setHoverStar(0)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <Star
              size={28}
              fill={(hoverStar || stars) >= s ? '#f59e0b' : 'none'}
              stroke="#f59e0b"
              style={{ transition: 'all 0.15s' }}
            />
          </button>
        ))}
        {stars > 0 && (
          <span style={{ color: '#f59e0b', fontWeight: 600, alignSelf: 'center', marginLeft: 4 }}>
            {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][stars]}
          </span>
        )}
      </div>

      {/* Review */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: 6 }}>
          Write a review (optional)
        </label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={3}
          placeholder="Great job, very thorough and professional..."
          style={{
            width: '100%', backgroundColor: '#1e293b', border: '1px solid #334155',
            color: 'white', borderRadius: 8, padding: '10px 12px', fontSize: '0.9rem',
            outline: 'none', resize: 'vertical', fontFamily: 'inherit'
          }}
        />
      </div>

      {/* Tip */}
      {job.employee_id && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
            <DollarSign size={14} /> Add a Tip for Your Cleaner (optional)
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[0, 5, 10, 20, 30].map(amt => (
              <button
                key={amt}
                type="button"
                onClick={() => setTipAmount(amt === 0 ? '' : amt.toString())}
                style={{
                  padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                  border: `1px solid ${(parseFloat(tipAmount) || 0) === amt ? '#f59e0b' : '#334155'}`,
                  background: (parseFloat(tipAmount) || 0) === amt ? 'rgba(245,158,11,0.15)' : '#1e293b',
                  color: (parseFloat(tipAmount) || 0) === amt ? '#f59e0b' : '#94a3b8',
                  fontSize: '0.85rem', fontWeight: 600
                }}
              >
                {amt === 0 ? 'No tip' : `$${amt}`}
              </button>
            ))}
            <input
              type="number"
              min="0"
              step="1"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              placeholder="Custom $"
              style={{
                width: 90, backgroundColor: '#1e293b', border: '1px solid #334155',
                color: 'white', borderRadius: 8, padding: '6px 10px', fontSize: '0.85rem', outline: 'none'
              }}
            />
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting || stars === 0}
        className="btn btn-primary"
        style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        <Star size={16} /> {submitting ? 'Submitting...' : `Submit Review${tipAmount && parseFloat(tipAmount) > 0 ? ` + $${tipAmount} Tip` : ''}`}
      </button>
    </div>
  );
}
