import React, { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Tag, Checkbox } from "antd";
const { Meta } = Card;
const colors = ["#f50", "#2db7f5", "#87d068", "#108ee9"];

function PokemonCard({
  pokemon,
  comparePokemons,
  isCompareActive,
  onHandleSelectPokemon,
}) {
  const navigate = useNavigate();

  const isSelected = useMemo(
    () => comparePokemons.includes(pokemon.id),
    [comparePokemons, pokemon.id]
  );

  const handlePokemonClick = () => navigate(`detail?pokemon=${pokemon.name}`)

  const handlePokemonSelect = () => onHandleSelectPokemon(pokemon)

  const handleCheckboxClick = (e) => e.stopPropagation()

  return (
    <Card
      hoverable
      className={`pokemon-card ${
        isSelected ? "pokemon-card-selected" : ""
      }`}
      onClick={handlePokemonClick}
      cover={
        <img
          alt={pokemon.name}
          className="pokemon-card__image"
          src={pokemon.sprites.other.dream_world.front_default}
        />
      }
    >
      {isCompareActive && (
        <Checkbox
          checked={isSelected}
          className="checkbox"
          onChange={handlePokemonSelect}
          onClick={handleCheckboxClick}
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
