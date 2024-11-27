import os
import platform
import subprocess
import shutil
import sys  # Import sys module

def build_backend():
    system = platform.system()
    backend_dir = os.path.join('backend', 'dist')

    executable_base_name = 'backend'

    if system == 'Windows':
        executable_name = 'backend.exe'
        pyinstaller_command = [
            sys.executable, '-m', 'PyInstaller',
            '--onefile',
            '--windowed',  # Added this option
            '--name', executable_base_name,
            'backend.py'
        ]
        output_dir = os.path.join(backend_dir, 'win')
    elif system == 'Darwin':
        executable_name = 'backend'
        pyinstaller_command = [
            sys.executable, '-m', 'PyInstaller',
            '--onefile',
            '--windowed',  # Added this option (optional for macOS)
            '--name', executable_base_name,
            'backend.py'
        ]
        output_dir = os.path.join(backend_dir, 'mac')
    elif system == 'Linux':
        executable_name = 'backend'
        pyinstaller_command = [
            sys.executable, '-m', 'PyInstaller',
            '--onefile',
            '--windowed',  # Added this option (optional for Linux)
            '--name', executable_base_name,
            'backend.py'
        ]
        output_dir = os.path.join(backend_dir, 'linux')
    else:
        print('Unsupported platform:', system)
        return

    # Change to the backend directory
    os.chdir('backend')

    print(f'Command to run: {pyinstaller_command}')
    # Run PyInstaller
    subprocess.run(pyinstaller_command, check=True)

    # Create output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Move the executable to the appropriate dist folder
    source_executable = os.path.join('dist', executable_name)
    destination_executable = os.path.join(output_dir, executable_name)
    if os.path.exists(destination_executable):
        os.remove(destination_executable)
    os.replace(source_executable, destination_executable)

    # Clean up build files
    spec_file_name = executable_base_name + '.spec'
    if os.path.exists(spec_file_name):
        os.remove(spec_file_name)

    if os.path.exists('build'):
        shutil.rmtree('build')
    if os.path.exists('dist'):
        shutil.rmtree('dist')

    print(f'Backend built for {system} at {destination_executable}')

if __name__ == '__main__':
    build_backend()
