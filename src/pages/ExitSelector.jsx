import React, { useState } from "react";
import { getl10n } from "../redux/l10n";
import {
  IonLabel,
  IonButton,
  IonModal,
  IonRow,
  IonText,
  IonCol,
  IonHeader,
  IonIcon,
  IonButtons,
  IonTitle,
  IonToolbar,
  IonCard,
  IonItem,
  IonContent,
  IonList,
  IonListHeader,
  IonChip,
  IonCardContent
} from "@ionic/react";
import Flag from "react-world-flags";
import * as icons from "ionicons/icons";
import exits from "../fragments/exitList";

class ExitSelector extends React.Component {
  constructor(props) {
    super(props);
    // load the current selection
    if (!localStorage.getItem("prefs.exit")) {
      localStorage.setItem("prefs.exit", "us-sfo-01.exits.geph.io");
    }
    this.props = props;
    this.state = {
      exit: localStorage.getItem("prefs.exit")
    };
  }

  componentDidMount() {}

  render() {
    const [lang, l10n] = getl10n();
    return (
      <div
        style={{
          marginBottom: "5px"
        }}
      >
        <ExitPick
          disabled={this.props.disabled}
          exit={this.state.exit}
          onSelect={exit => {
            localStorage.setItem("prefs.exit", exit);
            this.setState({ exit: exit });
          }}
        />
      </div>
    );
  }
}

const ExitPick = props => {
  const [showModal, setShowModal] = useState(false);
  let stats = exits[props.exit];
  const [lang, l10n] = getl10n();
  return [
    <IonModal isOpen={showModal}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{l10n.selectExit}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowModal(false)}>
              {l10n.cancel}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {Object.keys(exits).map((key, index) => (
            <IonItem
              key={key}
              button
              onClick={() => {
                setShowModal(false);
                props.onSelect(key);
              }}
            >
              <Flag
                code={exits[key].country}
                style={{
                  width: "32px",
                  display: "inline-block",
                  boxShadow: "0px 0px 3px #333333",
                  verticalAlign: "middle",
                  marginRight: "10px",
                  marginLeft: "10px"
                }}
              />
              {l10n.countries[exits[key].country]}

              <IonText color="medium">/{l10n.cities[exits[key].city]}</IonText>

              {exits[key].plus ? (
                <IonChip slot="end" color="success" style={{ marginLeft: 0 }}>
                  <IonLabel>{l10n.plus}</IonLabel>
                </IonChip>
              ) : (
                ""
              )}
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonModal>,
    <Flag
      code={stats.country}
      style={{
        height: "24px",
        display: "inline-block",
        boxShadow: "0px 0px 3px #333333",
        verticalAlign: "middle",
        marginRight: "-10px"
      }}
    />,
    <IonButton
      style={{ verticalAlign: "middle", textTransform: "none" }}
      color="dark"
      fill="clear"
      size="large"
      mode="ios"
      onClick={() => setShowModal(true)}
      disabled={props.disabled ? true : false}
    >
      {l10n.countries[stats.country]}
      <IonText color="medium">/{l10n.cities[stats.city]}</IonText>»
    </IonButton>
  ];
};

export default ExitSelector;
