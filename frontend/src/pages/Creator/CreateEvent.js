import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { communityAPI } from '../../services/api';

const CreateEvent = () => {
  const { id: communityId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Please provide valid start and end date/time');
      }

      const now = new Date();
      if (start <= now) {
        throw new Error('Start date/time must be in the future');
      }
      if (end <= start) {
        throw new Error('End date/time must be after start date/time');
      }

      const payload = {
        ...data,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };

      const response = await communityAPI.createEvent(communityId, payload);
      if (response.data && response.data.success) {
        toast.success('Event created successfully!');
        navigate(`/communities/${communityId}`);
      } else {
        throw new Error(response.data?.message || 'Failed to create event');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helpers to set min values on datetime-local inputs
  const toLocalDateTime = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };
  const minStart = toLocalDateTime(new Date());

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Create New Event</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title *</label>
          <input
            type="text"
            {...register('title', { required: 'Title is required' })}
            className="input w-full"
            placeholder="Enter event title"
          />
          {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Description *</label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={4}
            className="textarea w-full"
            placeholder="Describe the event..."
          />
          {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Start Date *</label>
          <input
            type="datetime-local"
            {...register('startDate', { required: 'Start date is required' })}
            className="input w-full"
            min={minStart}
          />
          {errors.startDate && <p className="text-red-600 text-sm mt-1">{errors.startDate.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">End Date *</label>
          <input
            type="datetime-local"
            {...register('endDate', { required: 'End date is required' })}
            className="input w-full"
            min={watch('startDate') || minStart}
          />
          {errors.endDate && <p className="text-red-600 text-sm mt-1">{errors.endDate.message}</p>}
        </div>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
