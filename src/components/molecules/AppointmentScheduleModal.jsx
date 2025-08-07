import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { appointmentService } from '@/services/api/appointmentService';
import { patientService } from '@/services/api/patientService';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';

const AppointmentScheduleModal = ({ isOpen, onClose, onAppointmentCreated }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    dateTime: '',
    type: '',
    provider: '',
    duration: 60,
    room: '',
    notes: ''
  });

  const appointmentTypes = [
    'Cleaning & Checkup',
    'Consultation',
    'Root Canal',
    'Filling',
    'Crown Placement',
    'X-Ray',
    'Follow-up',
    'Emergency',
    'Orthodontics'
  ];

  const providers = [
    'Dr. Smith',
    'Dr. Johnson',
    'Dr. Wilson',
    'Dr. Brown'
  ];

  const rooms = [
    'Room 1',
    'Room 2',
    'Room 3',
    'X-Ray Room',
    'Surgery Room'
  ];

  useEffect(() => {
    if (isOpen) {
      loadPatients();
    }
  }, [isOpen]);

  const loadPatients = async () => {
    try {
      const patientsData = await patientService.getAll();
      setPatients(patientsData);
    } catch (error) {
      toast.error('Failed to load patients');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.patientId) {
      toast.error('Please select a patient');
      return false;
    }
    if (!formData.dateTime) {
      toast.error('Please select date and time');
      return false;
    }
    if (!formData.type) {
      toast.error('Please select appointment type');
      return false;
    }
    if (!formData.provider) {
      toast.error('Please select a provider');
      return false;
    }
    if (!formData.room) {
      toast.error('Please select a room');
      return false;
    }

    // Check if appointment is in the past
    const appointmentDate = new Date(formData.dateTime);
    if (appointmentDate < new Date()) {
      toast.error('Cannot schedule appointments in the past');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const appointmentData = {
        patientId: formData.patientId,
        dateTime: formData.dateTime,
        type: formData.type,
        provider: formData.provider,
        duration: parseInt(formData.duration),
        room: formData.room,
        notes: formData.notes,
        status: 'pending'
      };

      await appointmentService.create(appointmentData);
      toast.success('Appointment scheduled successfully!');
      
      // Reset form
      setFormData({
        patientId: '',
        dateTime: '',
        type: '',
        provider: '',
        duration: 60,
        room: '',
        notes: ''
      });
      
      onAppointmentCreated?.();
      onClose();
    } catch (error) {
      toast.error('Failed to schedule appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      patientId: '',
      dateTime: '',
      type: '',
      provider: '',
      duration: 60,
      room: '',
      notes: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  // Get minimum date (today)
  const today = new Date();
  const minDate = today.toISOString().slice(0, 16);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Schedule New Appointment</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ApperIcon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient *
              </label>
              <Select
                value={formData.patientId}
                onChange={(value) => handleInputChange('patientId', value)}
                placeholder="Select a patient"
              >
{patients.map(patient => (
                  <option key={patient.Id} value={patient.Id.toString()}>
                    {patient.firstName || patient.first_name_c} {patient.lastName || patient.last_name_c} - {patient.phone || patient.phone_c}
                  </option>
                ))}
              </Select>
            </div>

            {/* Date and Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date & Time *
              </label>
              <Input
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => handleInputChange('dateTime', e.target.value)}
                min={minDate}
                className="w-full"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <Select
                value={formData.duration.toString()}
                onChange={(value) => handleInputChange('duration', parseInt(value))}
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
                <option value="120">120 minutes</option>
              </Select>
            </div>

            {/* Appointment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Type *
              </label>
              <Select
                value={formData.type}
                onChange={(value) => handleInputChange('type', value)}
                placeholder="Select appointment type"
              >
                {appointmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </div>

            {/* Provider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider *
              </label>
              <Select
                value={formData.provider}
                onChange={(value) => handleInputChange('provider', value)}
                placeholder="Select provider"
              >
                {providers.map(provider => (
                  <option key={provider} value={provider}>{provider}</option>
                ))}
              </Select>
            </div>

            {/* Room */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room *
              </label>
              <Select
                value={formData.room}
                onChange={(value) => handleInputChange('room', value)}
                placeholder="Select room"
              >
                {rooms.map(room => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </Select>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                placeholder="Additional notes or instructions..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Scheduling...</span>
                </div>
              ) : (
                'Schedule'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentScheduleModal;