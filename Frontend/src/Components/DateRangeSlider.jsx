import React, { useEffect, useRef, useState } from 'react';
import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';

function getDaysBetween(startDate, endDate) {
  return Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
}

function offsetDate(baseDate, offsetDays) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + offsetDays);
  return date;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // month is 0-based
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DateRangeSlider = ({ startDate, endDate, onChange }) => {
  const sliderRef = useRef(null);
  const [selectedRange, setSelectedRange] = useState([startDate, endDate]);

  useEffect(() => {
    if (!sliderRef.current) return;

    const totalDays = getDaysBetween(startDate, endDate);

    if (sliderRef.current.noUiSlider) {
      sliderRef.current.noUiSlider.destroy();
    }

    noUiSlider.create(sliderRef.current, {
      start: [0, totalDays],
      connect: true,
      range: {
        min: 0,
        max: totalDays
      },
      step: 1,
      margin: 1,
      tooltips: true,
      format: {
        to: value => {
          const date = offsetDate(startDate, Math.round(value));
          const dayAbbr = date.toLocaleDateString('es-MX', { weekday: 'short' });
          return `${dayAbbr}. ${date.getDate()}`;
        },
        from: value => parseInt(value)
      }
    });

    sliderRef.current.noUiSlider.on('update', (values) => {
      const [startOffset, endOffset] = sliderRef.current.noUiSlider.get(true);
      const newStart = offsetDate(startDate, Math.round(startOffset));
      const newEnd = offsetDate(startDate, Math.round(endOffset));
      setSelectedRange([newStart, newEnd]);
      if (onChange) onChange([newStart, newEnd]);
    });

    // Cleanup
    return () => {
      if (sliderRef?.current?.noUiSlider) {
        sliderRef?.current?.noUiSlider.destroy();
      }
    };
  }, [startDate, endDate]);

  return (
    <section>
      <div ref={sliderRef} style={{ margin: '2rem 0' }} />
      <p>
        Fechas Seleccionadas: <strong>{formatDate(selectedRange[0])}</strong> a <strong>{formatDate(selectedRange[1])}</strong>
      </p>
    </section>
  );
};

export default DateRangeSlider;