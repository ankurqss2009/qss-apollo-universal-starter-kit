import React from 'react';
import PropTypes from 'prop-types';

import Dropzone from 'react-dropzone';
import filesize from 'filesize';

import { Row, Col, Table, Button } from '@gqlapp/look-client-react';

const PictureView = ({ values: { pictures }, handleUploadFiles, handleRemoveFile, t }) => {
  const columns = [
    {
      title: t('table.column.name'),
      dataIndex: 'name',
      key: 'name',
      render(text, record) {
        return (
          <a href={record.path} download={text}>
            {text} ({filesize(record.size)})
          </a>
        );
      }
    },
    {
      title: t('table.column.actions'),
      key: 'actions',
      width: 50,
      render(text, record) {
        return (
          <Button color="primary" size="sm" onClick={() => handleRemoveFile(record.id)}>
            {t('table.btnDel')}
          </Button>
        );
      }
    }
  ];

  return (
    <div className="text-center">
      <Row>
        <Col xs={4}>
          <Dropzone
            onDrop={handleUploadFiles}
            style={{
              borderRadius: '0',
              border: 'none',
              borderRight: '1px solid #ccc',
              minHeight: '200px',
              height: '100%',
              display: 'flex'
            }}
          >
            <p className="text-primary" style={{ alignSelf: 'center' }}>
              {' '}
              {t('message')}
            </p>
          </Dropzone>
        </Col>
        <Col xs={8}>{pictures && <Table dataSource={pictures} columns={columns} />}</Col>
      </Row>
    </div>
  );
};

PictureView.propTypes = {
  files: PropTypes.array,
  handleUploadFiles: PropTypes.func.isRequired,
  handleRemoveFile: PropTypes.func.isRequired,
  pictures: PropTypes.array,
  t: PropTypes.func,
  values: PropTypes.any
};

export default PictureView;
