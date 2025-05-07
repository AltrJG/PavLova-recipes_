import React from 'react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';

const style = {
  top: '8%',
  right: 0,
  transform: 'translate(0, -50%)',
  lineHeight: '24px',
  fontFamily: 'Oswald',
  fontSize: '5rem'
};

const RadialChartComponent = ({data}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadialBarChart
        cx="50%"
        cy="50%"
        innerRadius="40%"
        outerRadius="110%"
        barSize={18}
        data={data}
      >
        <RadialBar
          minAngle={15}
          label={({ uv }) => uv}
          background
          clockWise
          dataKey="uv"
        />
        <Legend
          iconSize={10}
          layout="horizontal"
          verticalAlign="bottom"
          wrapperStyle={style}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  );
};

export default RadialChartComponent;