export class ExportError extends Error {
  constructor(title, message, remediation = [], details = null) {
    super(message);
    this.name = this.constructor.name;
    this.title = title;
    this.remediation = remediation;
    this.details = details;
  }
}

export class MissingAvatarError extends ExportError {
  constructor(details = null) {
    super(
      'Missing Avatar',
      'An avatar video is required for each scene/character, but one is missing.',
      [
        'Check the scenes listed in the editor timeline.',
        'Make sure each scene has an avatar generated or selected.',
        'Wait for avatar generation to complete before exporting.',
      ],
      details
    );
  }
}

export class MissingVoiceError extends ExportError {
  constructor(details = null) {
    super(
      'Missing Voice',
      'A voice track is required for each scene, but one is missing.',
      [
        'Select a voice in the configuration panel.',
        'Make sure you have text script or voice recording for each scene.',
        'Save changes and try exporting again.',
      ],
      details
    );
  }
}

export class UnsupportedFormatError extends ExportError {
  constructor(format, details = null) {
    super(
      'Unsupported Format',
      `The selected export format "${format}" is not supported.`,
      [
        'Open export options.',
        'Change format to MP4 or a supported format.',
      ],
      details
    );
  }
}

export class InsufficientSpaceError extends ExportError {
  constructor(details = null) {
    super(
      'Not Enough Space',
      'Your system does not have enough free storage for the export.',
      [
        'Free up disk space on your computer.',
        'Or try selecting a lower resolution/quality for export.',
      ],
      details
    );
  }
}

export class ExportFailedError extends ExportError {
  constructor(message = 'An unexpected error occurred while exporting.', details = null) {
    super(
      'Export Failed',
      message,
      [
        'Verify your network connection.',
        'Try exporting again in a few minutes.',
        'If the issue persists, contact support.',
      ],
      details
    );
  }
}
