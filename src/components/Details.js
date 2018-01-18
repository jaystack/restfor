import React from 'react';
import { connect } from 'react-redux';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import DateTimePicker from 'material-ui-datetimepicker';
import DatePickerDialog from 'material-ui/DatePicker/DatePickerDialog';
import TimePickerDialog from 'material-ui/TimePicker/TimePickerDialog';
import { invoke, closeDetails } from '../actionCreators';
import './Details.css';

class Details extends React.PureComponent {
  state = this.props.record;

  componentWillUpdate(nextProps) {
    if (nextProps.record !== this.props.record) this.setState(nextProps.record);
  }

  handleChange = propertyName => value => this.setState({ [propertyName]: value });
  handleSave = () => {};
  handleRemove = async () => {
    const { invoke, closeDetails, params: { resourceName, id } } = this.props;
    await invoke('DELETE', resourceName, '/', { body: [ id ] });
    closeDetails();
  };
  handleCancel = () => this.props.closeDetails();

  render() {
    const { params: { resourceName, id }, schema } = this.props;
    return (
      <div className="fitted column layout Details">
        <header className="dynamic layout">
          <Toolbar style={{ width: '100%' }}>
            <ToolbarGroup>
              <ToolbarTitle text={`${resourceName.toUpperCase()} / ${id.toString().toUpperCase()}`} />
            </ToolbarGroup>
            <ToolbarGroup>
              <RaisedButton label="Save" primary onClick={this.handleSave} />
              {id !== 'new' && <RaisedButton label="Remove" secondary onClick={this.handleRemove} />}
              <RaisedButton label="Close" onClick={this.handleCancel} />
            </ToolbarGroup>
          </Toolbar>
        </header>
        <main className="fitted column layout overflow-y">
          <table>
            <tbody>
              {Object.keys(schema).map(propertyName => (
                <tr key={propertyName}>
                  <td>{propertyName}</td>
                  <td>
                    {getPropertyComponent(
                      propertyName,
                      this.state[propertyName],
                      this.handleChange(propertyName),
                      schema[propertyName]
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    );
  }
}

const numberTypes = [ 'TINYINT', 'SMALLINT', 'MEDIUMINT', 'INTEGER', 'BIGINT', 'FLOAT', 'DOUBLE', 'DECIMAL', 'REAL' ];

const getPropertyComponent = (propertyName, value, onChange, schema) => {
  switch (schema.type) {
    case 'BOOLEAN':
      return <Toggle toggled={value} disabled={schema.autoGenerated} onToggle={(_, value) => onChange(value)} />;
    case 'DATE':
      return (
        <DateTimePicker
          value={new Date(value)}
          DatePicker={DatePickerDialog}
          TimePicker={TimePickerDialog}
          datePickerMode="landscape"
          disabled={schema.autoGenerated}
        />
      );
    case 'ENUM':
      return (
        <SelectField value={value}>
          {schema.values.map(value => <MenuItem key={value} value={value} primaryText={value} />)}
        </SelectField>
      );
    default:
      return (
        <TextField
          name={propertyName}
          type={numberTypes.includes(schema.type) ? 'number' : 'text'}
          value={value}
          disabled={schema.autoGenerated}
        />
      );
  }
};

export default connect(
  ({ schemas, resources }, { params: { resourceName, id } }) => ({
    schema: schemas[resourceName] || {},
    record:
      ((resources[resourceName] && resources[resourceName].items) || []).find(record => record.id === Number(id)) || {}
  }),
  { invoke, closeDetails }
)(Details);
