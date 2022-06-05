import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Tag,
  Checkbox
} from "antd";
const { Meta } = Card;
const colors = ["#f50", "#2db7f5", "#87d068", "#108ee9"];

function PokemonCard({
    pokemon,
    comparePokemons,
    isCompareActive,
    onHandleSelectPokemon
}) {
  const navigate = useNavigate();
  return (
    <Card
      hoverable
      className={`pokemon-card ${
        comparePokemons.includes(pokemon.id)
          ? "pokemon-card-selected"
          : ""
      }`}
      onClick={() => navigate(`detail?pokemon=${pokemon.name}`)}
      cover={
        <img
          alt={pokemon.name}
          className="pokemon-card__image"
          src={pokemon.sprites.other.dream_world.front_default}
          loading="lazy"
        />
      }
    >
      {isCompareActive && (
        <Checkbox
          checked={comparePokemons.includes(pokemon.id)}
          className="checkbox"
          onChange={() => onHandleSelectPokemon(pokemon)}
          onClick={(e) => e.stopPropagation()}
        />
      )}
      <Meta
        title={`#${pokemon.id} ${pokemon.name}`}
        description={pokemon.types.map((d, idx) => (
          <Tag key={idx} color={colors[Math.floor(Math.random() * 3)]}>
            {d.type.name}
          </Tag>
        ))}
      />
    </Card>
  );
}

export default memo(PokemonCard);
