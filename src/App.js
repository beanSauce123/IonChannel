import React, { useState, useEffect } from "react";
import { Mafs, Coordinates, Point, Line } from "mafs";

const App = () => {
  const [channelOpen, setChannelOpen] = useState(false);
  const [ionPosition, setIonPosition] = useState(-15); // Ion starts far from the channel
  const [speed, setSpeed] = useState(100); // Speed control for ion movement
  const [pRight, setPRight] = useState(0.6); // Probability of moving right
  const [pStay, setPStay] = useState(0.1); // Probability of staying in place
  const [membranePotential, setMembranePotential] = useState(-70); // Membrane potential in mV
  const thresholdPotential = -55; // Membrane potential at which the channel is 50% likely to be open
  const k = 0.1; // Steepness of the sigmoid curve
  const channelPosition = 0; // Channel is at the origin

  // Sigmoid function to determine the probability of the channel being open
  const sigmoid = (V) => {
    return 1 / (1 + Math.exp(-k * (V - thresholdPotential)));
  };

  // Manage channel's open/close state based on membrane potential
  useEffect(() => {
    const updateChannelState = setInterval(() => {
      const P_open = sigmoid(membranePotential);
      setChannelOpen(Math.random() < P_open); // Open channel based on probability
    }, 1000); // Evaluate every second

    return () => clearInterval(updateChannelState);
  }, [membranePotential]);

  // Manage ion random walk
  useEffect(() => {
    const moveIon = setInterval(() => {
      setIonPosition(prevPosition => {
        if (prevPosition < channelPosition || channelOpen) {
          const rand = Math.random();
          let step = 0;

          if (rand < pRight) {
            step = 1; // Move right with probability pRight
          } else if (rand < pRight + pStay) {
            step = 0; // Stay in place with probability pStay
          } else {
            step = -1; // Move left with remaining probability
          }

          return prevPosition + step;
        }
        return prevPosition; // Stop moving if the ion has reached the channel and the channel is closed
      });
    }, speed);

    return () => clearInterval(moveIon);
  }, [channelOpen, pRight, pStay, speed]);

  return (
    <div>
      <h1>Voltage-Gated Ion Channel Simulation</h1>
      <p>
        This simulation models the behavior of a voltage-gated ion channel in a neuron. 
        The ion channel opens and closes based on the membrane potential of the neuron. 
        When the channel is open, ions can move through it, and their movement is governed 
        by a random walk, simulating diffusion. The probability of the channel being open 
        is determined by a sigmoidal relationship with the membrane potential.
      </p>
      
      <h2>Simulation Parameters</h2>
      <ul>
        <li>
          <strong>Ion Speed:</strong> Controls how fast the ion moves across the channel. 
          A lower value increases the speed by shortening the time interval between position updates.
        </li>
        <li>
          <strong>Probability of Moving Right (pRight):</strong> The likelihood that the ion will move 
          to the right in each step of the random walk.
        </li>
        <li>
          <strong>Probability of Staying in Place (pStay):</strong> The likelihood that the ion will 
          remain in its current position during each step of the random walk.
        </li>
        <li>
          <strong>Membrane Potential (mV):</strong> Represents the electrical potential of the neuron's membrane. 
          As the potential increases, the probability of the channel being open also increases.
        </li>
      </ul>

      <div>
        {/* Control sliders */}
        <label>
          Ion Speed:
          <input
            type="range"
            min="10"
            max="200"
            step="10"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
          />
        </label>

        <label>
          Probability of Moving Right (pRight):
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.1"
            value={pRight}
            onChange={(e) => setPRight(parseFloat(e.target.value))}
          />
        </label>

        <label>
          Probability of Staying in Place (pStay):
          <input
            type="range"
            min="0.0"
            max="0.5"
            step="0.05"
            value={pStay}
            onChange={(e) => setPStay(parseFloat(e.target.value))}
          />
        </label>

        <label>
          Membrane Potential (mV):
          <input
            type="range"
            min="-90"
            max="40"
            step="5"
            value={membranePotential}
            onChange={(e) => setMembranePotential(parseInt(e.target.value))}
          />
        </label>

        <p>Membrane Potential: {membranePotential} mV</p>
        <p>Probability of Channel Open: {sigmoid(membranePotential).toFixed(2)}</p>
      </div>

      <Mafs>
        <Coordinates.Cartesian
          subdivisions={2}
          xExtent={[-20, 20]}
          yExtent={[-5, 5]}
        />

        {/* Channel Representation */}
        <Line.Segment
          point1={[channelPosition - 1, -1]}
          point2={[channelPosition + 1, 1]}
          color={channelOpen ? "green" : "red"}
          thickness={3}
        />
        <Line.Segment
          point1={[channelPosition + 1, -1]}
          point2={[channelPosition - 1, 1]}
          color={channelOpen ? "green" : "red"}
          thickness={3}
        />

        {/* Ion Representation */}
        <Point x={ionPosition} y={0} color="blue" />
      </Mafs>
    </div>
  );
};

export default App;
