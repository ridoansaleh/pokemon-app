import React, { memo } from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";

function ComparisonNav({ comparePokemons, onCancelCompare }) {
  return (
    <div className="comparison-nav">
      <div>
        {comparePokemons.map((pokemon, idx) => (
          <img
            key={idx}
            src={pokemon.sprites.front_default}
            alt={pokemon.name}
            className="compare-thumbnail"
          />
        ))}
      </div>
      {comparePokemons.length === 2 ? (
        <Link
          to={`comparison/?pokedex=${comparePokemons[0].name},${comparePokemons[1].name}`}
        >
          <Button type="primary" danger>
            Compare
          </Button>
        </Link>
      ) : (
        <Button type="primary" ghost onClick={onCancelCompare}>
          Cancel
        </Button>
      )}
    </div>
  );
}

export default memo(ComparisonNav);
