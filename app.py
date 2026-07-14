from flask import Flask, render_template, request, flash, redirect, url_for  
from database_helper import get_urls_passwords_from_db  
from flask_sqlalchemy import SQLAlchemy  
import subprocess  

# Inicializa la aplicación Flask  
app = Flask(__name__)  

# Configura la conexión a la base de datos  
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:r0b0tsat@localhost/anviz_cayas'  # Actualiza con tus credenciales y nombre de base de datos  
db = SQLAlchemy(app)  

# Definir modelo de Log para la base de datos  
class Log(db.Model):  
    id = db.Column(db.Integer, primary_key=True)  
    timestamp = db.Column(db.TIMESTAMP, default=db.func.current_timestamp())  
    message = db.Column(db.Text)  
    device = db.Column(db.String(50))  
    username = db.Column(db.String(50))  # Agregar campo para el nombre de usuario  

# Función para cargar los datos de la base de datos y renderizar la plantilla  
def load_and_render_template():  
    urls, passwords, crys, posicion, dispositivo, tipo_dis, record, id_anviz, device = get_urls_passwords_from_db()  
    return render_template('index.html', urls=urls, passwords=passwords, crys=crys, posicion=posicion, dispositivo=dispositivo, tipo_dis=tipo_dis, record=record, id_anviz=id_anviz, device=device)  

@app.route('/')  
def show_data():  
    return load_and_render_template()  

@app.route('/run_selenium', methods=['POST'])  
def run_selenium():  
    selected_index = int(request.form['selected_index'])  
    usuario = request.form.get('usuario')
    print(f'Valor del usuario obtenido: {usuario}')  
    dispositivo = request.form.get('dispositivo')  

    # Crear un log básico con los datos del usuario sin importar si el reinicio fue exitoso o no  
    log_message = f"Intento de reinicio en el dispositivo: {dispositivo}"  
    new_log = Log(message=log_message, device=dispositivo, username=usuario)  
    
    try:  
        # Ejecutar el script de automatización y capturar el código de salida  
        result = subprocess.run(['python', 'automate_anviz.py', str(selected_index)], check=True)  

        # Si la ejecución es exitosa, registrar el log de éxito  
        success_log_message = "Reinicio Completado"  
        new_log.message = success_log_message  # Actualiza el mensaje en el log  
        db.session.add(new_log)  
        db.session.commit()  

        flash(f'Reinicio con éxito en el dispositivo {dispositivo}', 'success')  # Mensaje de éxito  
        
        return '', 204  # Retornar 204 No Content si el proceso fue exitoso  
        
    except subprocess.CalledProcessError:  
        # En caso de error, actualizar el log con el mensaje de error  
        error_log_message = f'Error de reinicio: No se pudo autenticar el dispositivo {dispositivo}'  
        new_log.message = error_log_message  # Actualiza el mensaje en el log  
        db.session.add(new_log)  # Guarda el log incluso si hubo error  
        db.session.commit()  

        flash(error_log_message, 'danger')  # Mensaje de error  
        
        return redirect(url_for('show_data', usuario=usuario))  # Redirigir a la página principal en caso de error  
        
    except Exception as e:  
        # Mensaje para cualquier otro error  
        unexpected_error_message = f'Error inesperado: {str(e)}'  
        new_log.message = unexpected_error_message  # Actualiza el mensaje en el log  
        db.session.add(new_log)  # Guarda el log aún en caso de error inesperado  
        db.session.commit()  

        flash(unexpected_error_message, 'danger')  # Mensaje para cualquier otro error  
        
        return redirect(url_for('show_data', usuario=usuario))  # Redireccionar también en caso de error inesperado  

if __name__ == '__main__':  
    app.run(host='', port=)

    # Producción de dispositivos de reinicio #