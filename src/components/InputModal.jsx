import { useState } from 'react';
import Modal from './Modal';
import './InputModal.css';

const InputModal = ({ show, onClose, onConfirm, title, placeholder, confirmText = '确定', cancelText = '取消' }) => {
  const [value, setValue] = useState('');

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value.trim());
      setValue('');
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  const handleClose = () => {
    setValue('');
    onClose();
  };

  return (
    <Modal show={show} onClose={handleClose} title={title} showCloseButton={false}>
      <div className="input-modal-content">
        <input
          type="text"
          className="input-modal-field"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          autoFocus
        />
        <div className="input-modal-buttons">
          <button className="input-modal-btn cancel" onClick={handleClose}>
            {cancelText}
          </button>
          <button className="input-modal-btn confirm" onClick={handleConfirm} disabled={!value.trim()}>
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default InputModal;
