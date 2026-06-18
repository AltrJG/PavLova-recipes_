import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';



const COLORS = ['#FFE600', '#FFC300', '#FF9900', '#FF5E00', '#E63900'];

const PieChartComponent = ({data}) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Chart */}
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
  
        {/* Legend */}
        <div style={{ marginLeft: '2rem', flexBasis: '60%' }}>
          {data.map((entry, index) => (
            <div key={`legend-${index}`} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.8rem' }}>
              <div style={{
                width: 20,
                height: 20,
                backgroundColor: COLORS[index % COLORS.length],
                marginRight: 8,
                borderRadius: '50%'
              }} />
              <span style={{ fontSize: '1.2rem', color: '#333', fontFamily: 'Oswald' }}>{`${entry.name} - ${entry.value}%`}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default PieChartComponent;