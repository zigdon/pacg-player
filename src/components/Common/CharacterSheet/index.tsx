import React, { useState, MouseEvent, ChangeEvent } from "react";
import {
  useCharacter,
  useUpdateCharacter,
} from "../../../firestore/wiki/character";
import {
  CircularProgress,
  Container,
  Typography,
  Link,
  Tabs,
  Tab,
} from "@material-ui/core";
import { ErrorDisplay } from "../ErrorDisplay";
import { makeStyles } from "@material-ui/core/styles";
import { Checkboxes } from "./Checkboxes";
import { Powers } from "./Powers";
import { useCharacterStyles } from "./common";
import LockIcon from "@material-ui/icons/Lock";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import { useDebounceUpdate } from "../useDebounceUpdate";
import { useCardSystem } from "../../../firestore/wiki/card-systems";
import { useDeck } from "../../../firestore/wiki/deck";
import { UploadField } from "../UploadField";
import { CardsList } from "./CardsList";
import { WikiEditTextField } from "./WikiEditTextField";
import { WikiEditAutoInsertDropdown } from "./WikiEditAutoInsertDropdown";
import { Skills } from "./Skills";

const useContainerStyles = makeStyles((theme) => ({
  container: {
    display: "grid",
    gridTemplateColumns: "auto auto auto",
    gridTemplateRows: "auto auto auto",
    gap: "1em 1em",
    maxWidth: "100%",
  },
  header: {
    gridColumnStart: 1,
    gridColumnEnd: 2,
    gridRowStart: 1,
    gridRowEnd: 3,
    textAlign: "center",
  },
  description: {
    gridColumnStart: 2,
    gridColumnEnd: 4,
    gridRowStart: 1,
    gridRowEnd: 2,
  },
  skills: {
    whiteSpace: "nowrap",
    display: "flex",
    flexDirection: "column",
    width: "min-content",
    gridColumnStart: 2,
    gridColumnEnd: 3,
    gridRowStart: 2,
    gridRowEnd: 3,
  },
  powers: {
    gridColumnStart: 1,
    gridColumnEnd: 4,
    gridRowStart: 3,
    gridRowEnd: 4,
    display: "flex",
    flexDirection: "row",
    width: "100%",
  },
  cards: {
    whiteSpace: "nowrap",
    gridColumnStart: 3,
    gridColumnEnd: 4,
    gridRowStart: 2,
    gridRowEnd: 3,
    width: "100%",
  },
}));

const useStyles = makeStyles((theme) => ({
  descriptionText: {
    width: "100%",
    display: "inline-block",
  },
  powersContent: {
    flexGrow: 1,
    flexShrink: 1,
  },
}));

const defaultOrder: { [key: string]: number } = {
  Strength: 0,
  Dexterity: 1,
  Constitution: 2,
  Intelligence: 3,
  Wisdom: 4,
  Charisma: 5,
};

export function CharacterSheet({
  wikiMode,
  allowCharacterEdit,
  systemId,
  deckId,
  characterId,
}: {
  wikiMode?: boolean;
  allowCharacterEdit?: boolean;
  systemId: string;
  deckId: string;
  characterId: string;
}) {
  const [system, , systemError] = useCardSystem(systemId);
  const systemData = system?.data();
  const [deck, , deckError] = useDeck(systemId, deckId);
  const deckData = deck?.data();
  const [character, loading, error] = useCharacter(
    systemId,
    deckId,
    characterId
  );
  const characterData = character?.data();
  const characterStyles = useCharacterStyles();
  const containerStyles = useContainerStyles();
  const styles = useStyles();
  const [selectedPowers, setSelectedPowers] = useState(-1);
  const [wikiEdit, setWikiEdit] = useState(false);
  const [updateCharacter, updateError] = useUpdateCharacter(
    systemId,
    deckId,
    characterId
  );

  const imageFields = useDebounceUpdate(
    characterData?.image || "",
    (e: ChangeEvent<HTMLInputElement>) => e.currentTarget.value,
    (image) =>
      characterData &&
      updateCharacter({
        ...characterData,
        image,
      })
  );

  return (
    <Container>
      <br />
      {wikiMode ? (
        <Link
          className={characterStyles.mainEdit}
          href="#"
          onClick={(e: MouseEvent) => {
            e.preventDefault();
            setWikiEdit(!wikiEdit);
          }}
        >
          {wikiEdit ? <LockOpenIcon /> : <LockIcon />}
        </Link>
      ) : null}
      <ErrorDisplay label="Failed to load character" error={error} />
      <ErrorDisplay label="Failed to load system" error={systemError} />
      <ErrorDisplay label="Failed to load deck" error={deckError} />
      <ErrorDisplay label="Failed to update character" error={updateError} />
      {loading ? <CircularProgress /> : null}
      <div
        style={{ display: loading ? "none" : undefined }}
        className={containerStyles.container}
      >
        <div className={containerStyles.header}>
          <div className={characterStyles.headerHighlight}>
            <WikiEditTextField
              wikiEdit={wikiEdit}
              label="Name"
              {...useDebounceUpdate(
                characterData?.name || "",
                (e: ChangeEvent<HTMLInputElement>) => e.currentTarget.value,
                (name) =>
                  characterData &&
                  updateCharacter({
                    ...characterData,
                    name,
                  })
              )}
              fullWidth
            />
            <WikiEditAutoInsertDropdown
              wikiEdit={wikiEdit}
              id="traits"
              options={characterData?.traits || []}
              onAddOption={() => {}}
              label="Traits"
              value={characterData?.traits || []}
              onChange={(traits: string[]) =>
                characterData &&
                updateCharacter({
                  ...characterData,
                  traits,
                })
              }
              fullWidth
              multiple
            />
          </div>
          {systemData?.logo ? (
            <>
              <img
                src={systemData.logo}
                className={characterStyles.logo}
                alt=""
              />
              <br />
            </>
          ) : null}
          {deckData?.logo ? (
            <img src={deckData.logo} className={characterStyles.logo} alt="" />
          ) : null}
          {characterData?.image ? (
            <img
              src={characterData.image}
              className={characterStyles.headerImage}
              alt=""
            />
          ) : null}
          {wikiEdit ? (
            <UploadField label="Image" {...imageFields} fullWidth />
          ) : null}
        </div>
        <div className={containerStyles.description}>
          <WikiEditTextField
            label="Description"
            {...useDebounceUpdate(
              characterData?.description || "",
              (e: ChangeEvent<HTMLInputElement>) => e.currentTarget.value,
              (description) =>
                characterData &&
                updateCharacter({
                  ...characterData,
                  description,
                })
            )}
            multiline
            fullWidth
            className={styles.descriptionText}
          />
        </div>
        <div className={containerStyles.skills}>
          <Skills
            allowCharacterEdit={allowCharacterEdit}
            wikiEdit={wikiEdit}
            characterData={characterData}
            updateCharacter={updateCharacter}
          />
        </div>
        <div className={containerStyles.powers}>
          <div>
            <Tabs orientation="vertical" value={selectedPowers}>
              <Tab
                disabled={!allowCharacterEdit && !wikiMode}
                onClick={() => setSelectedPowers(-1)}
                value={-1}
                label="Base"
              />
              {characterData?.roles.map((v, idx) => (
                <Tab
                  disabled={!allowCharacterEdit && !wikiMode}
                  onClick={() => setSelectedPowers(idx)}
                  key={idx}
                  value={idx}
                  label={v.name}
                />
              ))}
            </Tabs>
          </div>
          <div className={styles.powersContent}>
            <Typography className={characterStyles.listHeader}>
              Powers
            </Typography>
            <Powers
              powers={
                selectedPowers === -1
                  ? characterData?.base
                  : characterData?.roles[selectedPowers]
              }
              allowCharacterEdit={allowCharacterEdit}
              wikiMode={wikiMode}
            />
          </div>
        </div>
        <div className={containerStyles.cards}>
          <CardsList
            allowCharacterEdit={allowCharacterEdit}
            wikiEdit={wikiEdit}
            characterData={characterData}
            updateCharacter={updateCharacter}
          />
        </div>
      </div>
    </Container>
  );
}
