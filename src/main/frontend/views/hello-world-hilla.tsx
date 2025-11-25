import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { useSignal } from '@vaadin/hilla-react-signals';
import { Button, Notification, TextField } from '@vaadin/react-components';
import { HelloWorldService } from 'Frontend/generated/endpoints.js';
import {useAuth} from "Frontend/util/auth";

export const config: ViewConfig = {
  menu: { order: 6, icon: 'line-awesome/svg/globe-solid.svg' },
  title: 'Hello World Hilla',
};

export default function HelloWorldHillaView() {
  const name = useSignal('');
    const { state, logout } = useAuth();

    if(state){
        console.log("state", state)
    }
  return (
    <>
      
    </>
  );
}
