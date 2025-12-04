import {
  Button,
  Dialog,
  MultiSelectComboBox,
  TextField,
  VerticalLayout,
} from '@vaadin/react-components';
import User from 'Frontend/generated/com/adudu/ashpalt/models/User';
import { ChatEndpoint } from 'Frontend/generated/endpoints';
import { useEffect, useState } from 'react';

interface CreateGroupModalProps {
  opened: boolean;
  onClose: () => void;
  onCreate: (name: string, userIds: string[]) => void;
}

export default function CreateGroupModal({ opened, onClose, onCreate }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (opened) {
      ChatEndpoint.getAllUsers().then(setUsers);
    }
  }, [opened]);

  const handleCreate = () => {
    if (name && selectedUsers.length > 0) {
      onCreate(
        name,
        selectedUsers.map((u) => u.id!)
      );
      onClose();
      setName('');
      setSelectedUsers([]);
    }
  };

  const footer = (
    <>
      <Button theme="tertiary" onClick={onClose}>
        Cancel
      </Button>
      <Button theme="primary" onClick={handleCreate}>
        Create
      </Button>
    </>
  );

  return (
    <Dialog
      headerTitle="Create Group"
      opened={opened}
      onOpenedChanged={(e) => !e.detail.value && onClose()}
      footer={footer}
    >
      <VerticalLayout style={{ width: '400px', maxWidth: '100%' }}>
        <TextField
          label="Group Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full"
        />

        <MultiSelectComboBox
          label="Participants"
          items={users}
          itemLabelPath="username"
          selectedItems={selectedUsers}
          onSelectedItemsChanged={(e) => setSelectedUsers(e.detail.value)}
          className="w-full"
        />
      </VerticalLayout>
    </Dialog>
  );
}
