import express from 'express';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Supported languages
const supportedLanguages = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ru: 'Русский',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
  hi: 'हिन्दी'
};

// Translation data
const translations = {
  en: {
    // Common
    success: 'Success',
    error: 'Error',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    
    // Authentication
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    
    // Navigation
    dashboard: 'Dashboard',
    classes: 'Classes',
    workouts: 'Workouts',
    profile: 'Profile',
    settings: 'Settings',
    notifications: 'Notifications',
    social: 'Social',
    subscriptions: 'Subscriptions',
    
    // Classes
    bookClass: 'Book Class',
    classDetails: 'Class Details',
    trainer: 'Trainer',
    duration: 'Duration',
    capacity: 'Capacity',
    price: 'Price',
    schedule: 'Schedule',
    availableSlots: 'Available Slots',
    bookedClasses: 'Booked Classes',
    myBookings: 'My Bookings',
    
    // Workouts
    logWorkout: 'Log Workout',
    workoutHistory: 'Workout History',
    exercise: 'Exercise',
    sets: 'Sets',
    reps: 'Reps',
    weight: 'Weight',
    calories: 'Calories',
    duration: 'Duration',
    notes: 'Notes',
    
    // Profile
    personalInfo: 'Personal Information',
    contactInfo: 'Contact Information',
    emergencyContact: 'Emergency Contact',
    fitnessGoals: 'Fitness Goals',
    medicalConditions: 'Medical Conditions',
    changePassword: 'Change Password',
    updateProfile: 'Update Profile',
    
    // Notifications
    newNotification: 'New Notification',
    classReminder: 'Class Reminder',
    paymentSuccess: 'Payment Successful',
    subscriptionExpiry: 'Subscription Expiring',
    
    // Messages
    welcomeMessage: 'Welcome to GymApp!',
    loginSuccess: 'Login successful',
    registrationSuccess: 'Registration successful',
    profileUpdated: 'Profile updated successfully',
    classBooked: 'Class booked successfully',
    workoutLogged: 'Workout logged successfully',
    paymentProcessed: 'Payment processed successfully',
    
    // Errors
    invalidCredentials: 'Invalid email or password',
    userNotFound: 'User not found',
    classNotFound: 'Class not found',
    bookingFailed: 'Booking failed',
    paymentFailed: 'Payment failed',
    networkError: 'Network error. Please try again.',
    serverError: 'Server error. Please try again later.'
  },
  
  es: {
    // Common
    success: 'Éxito',
    error: 'Error',
    loading: 'Cargando...',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    view: 'Ver',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    confirm: 'Confirmar',
    yes: 'Sí',
    no: 'No',
    
    // Authentication
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    logout: 'Cerrar Sesión',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    firstName: 'Nombre',
    lastName: 'Apellido',
    forgotPassword: '¿Olvidaste tu contraseña?',
    resetPassword: 'Restablecer Contraseña',
    
    // Navigation
    dashboard: 'Panel de Control',
    classes: 'Clases',
    workouts: 'Entrenamientos',
    profile: 'Perfil',
    settings: 'Configuración',
    notifications: 'Notificaciones',
    social: 'Social',
    subscriptions: 'Suscripciones',
    
    // Classes
    bookClass: 'Reservar Clase',
    classDetails: 'Detalles de la Clase',
    trainer: 'Entrenador',
    duration: 'Duración',
    capacity: 'Capacidad',
    price: 'Precio',
    schedule: 'Horario',
    availableSlots: 'Espacios Disponibles',
    bookedClasses: 'Clases Reservadas',
    myBookings: 'Mis Reservas',
    
    // Workouts
    logWorkout: 'Registrar Entrenamiento',
    workoutHistory: 'Historial de Entrenamientos',
    exercise: 'Ejercicio',
    sets: 'Series',
    reps: 'Repeticiones',
    weight: 'Peso',
    calories: 'Calorías',
    duration: 'Duración',
    notes: 'Notas',
    
    // Profile
    personalInfo: 'Información Personal',
    contactInfo: 'Información de Contacto',
    emergencyContact: 'Contacto de Emergencia',
    fitnessGoals: 'Objetivos de Fitness',
    medicalConditions: 'Condiciones Médicas',
    changePassword: 'Cambiar Contraseña',
    updateProfile: 'Actualizar Perfil',
    
    // Notifications
    newNotification: 'Nueva Notificación',
    classReminder: 'Recordatorio de Clase',
    paymentSuccess: 'Pago Exitoso',
    subscriptionExpiry: 'Suscripción por Vencer',
    
    // Messages
    welcomeMessage: '¡Bienvenido a GymApp!',
    loginSuccess: 'Inicio de sesión exitoso',
    registrationSuccess: 'Registro exitoso',
    profileUpdated: 'Perfil actualizado exitosamente',
    classBooked: 'Clase reservada exitosamente',
    workoutLogged: 'Entrenamiento registrado exitosamente',
    paymentProcessed: 'Pago procesado exitosamente',
    
    // Errors
    invalidCredentials: 'Correo o contraseña inválidos',
    userNotFound: 'Usuario no encontrado',
    classNotFound: 'Clase no encontrada',
    bookingFailed: 'Reserva fallida',
    paymentFailed: 'Pago fallido',
    networkError: 'Error de red. Por favor intenta de nuevo.',
    serverError: 'Error del servidor. Por favor intenta más tarde.'
  },
  
  fr: {
    // Common
    success: 'Succès',
    error: 'Erreur',
    loading: 'Chargement...',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    view: 'Voir',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    confirm: 'Confirmer',
    yes: 'Oui',
    no: 'Non',
    
    // Authentication
    login: 'Connexion',
    register: 'S\'inscrire',
    logout: 'Déconnexion',
    email: 'Email',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    firstName: 'Prénom',
    lastName: 'Nom de famille',
    forgotPassword: 'Mot de passe oublié?',
    resetPassword: 'Réinitialiser le mot de passe',
    
    // Navigation
    dashboard: 'Tableau de bord',
    classes: 'Cours',
    workouts: 'Entraînements',
    profile: 'Profil',
    settings: 'Paramètres',
    notifications: 'Notifications',
    social: 'Social',
    subscriptions: 'Abonnements',
    
    // Classes
    bookClass: 'Réserver un cours',
    classDetails: 'Détails du cours',
    trainer: 'Entraîneur',
    duration: 'Durée',
    capacity: 'Capacité',
    price: 'Prix',
    schedule: 'Horaire',
    availableSlots: 'Places disponibles',
    bookedClasses: 'Cours réservés',
    myBookings: 'Mes réservations',
    
    // Workouts
    logWorkout: 'Enregistrer l\'entraînement',
    workoutHistory: 'Historique des entraînements',
    exercise: 'Exercice',
    sets: 'Séries',
    reps: 'Répétitions',
    weight: 'Poids',
    calories: 'Calories',
    duration: 'Durée',
    notes: 'Notes',
    
    // Profile
    personalInfo: 'Informations personnelles',
    contactInfo: 'Informations de contact',
    emergencyContact: 'Contact d\'urgence',
    fitnessGoals: 'Objectifs de fitness',
    medicalConditions: 'Conditions médicales',
    changePassword: 'Changer le mot de passe',
    updateProfile: 'Mettre à jour le profil',
    
    // Notifications
    newNotification: 'Nouvelle notification',
    classReminder: 'Rappel de cours',
    paymentSuccess: 'Paiement réussi',
    subscriptionExpiry: 'Abonnement expirant',
    
    // Messages
    welcomeMessage: 'Bienvenue sur GymApp!',
    loginSuccess: 'Connexion réussie',
    registrationSuccess: 'Inscription réussie',
    profileUpdated: 'Profil mis à jour avec succès',
    classBooked: 'Cours réservé avec succès',
    workoutLogged: 'Entraînement enregistré avec succès',
    paymentProcessed: 'Paiement traité avec succès',
    
    // Errors
    invalidCredentials: 'Email ou mot de passe invalide',
    userNotFound: 'Utilisateur non trouvé',
    classNotFound: 'Cours non trouvé',
    bookingFailed: 'Réservation échouée',
    paymentFailed: 'Paiement échoué',
    networkError: 'Erreur réseau. Veuillez réessayer.',
    serverError: 'Erreur serveur. Veuillez réessayer plus tard.'
  }
};

// Get supported languages
router.get('/languages', (req, res) => {
  res.json({
    success: true,
    message: 'Supported languages retrieved successfully',
    data: supportedLanguages
  });
});

// Get translations for a specific language
router.get('/translations/:language', (req, res) => {
  try {
    const { language } = req.params;
    
    if (!supportedLanguages[language as keyof typeof supportedLanguages]) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported language'
      });
    }
    
    const translation = translations[language as keyof typeof translations] || translations.en;
    
    res.json({
      success: true,
      message: 'Translations retrieved successfully',
      data: {
        language,
        translations: translation
      }
    });
  } catch (error) {
    console.error('Get translations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user's preferred language
router.get('/preference', authenticateToken, async (req, res) => {
  try {
    // In a real implementation, this would be stored in the user's profile
    const preferredLanguage = req.user.preferredLanguage || 'en';
    
    res.json({
      success: true,
      message: 'User language preference retrieved successfully',
      data: {
        language: preferredLanguage,
        languageName: supportedLanguages[preferredLanguage as keyof typeof supportedLanguages]
      }
    });
  } catch (error) {
    console.error('Get language preference error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update user's preferred language
router.put('/preference', authenticateToken, async (req, res) => {
  try {
    const { language } = req.body;
    
    if (!supportedLanguages[language as keyof typeof supportedLanguages]) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported language'
      });
    }
    
    // Update user's preferred language
    // In a real implementation, this would update the user's profile in the database
    req.user.preferredLanguage = language;
    
    res.json({
      success: true,
      message: 'Language preference updated successfully',
      data: {
        language,
        languageName: supportedLanguages[language as keyof typeof supportedLanguages]
      }
    });
  } catch (error) {
    console.error('Update language preference error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get localized content for specific features
router.get('/content/:feature/:language', (req, res) => {
  try {
    const { feature, language } = req.params;
    
    if (!supportedLanguages[language as keyof typeof supportedLanguages]) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported language'
      });
    }
    
    // Feature-specific translations
    const featureTranslations = {
      onboarding: {
        en: {
          welcome: 'Welcome to GymApp!',
          step1: 'Set up your profile',
          step2: 'Choose your fitness goals',
          step3: 'Book your first class',
          complete: 'You\'re all set!'
        },
        es: {
          welcome: '¡Bienvenido a GymApp!',
          step1: 'Configura tu perfil',
          step2: 'Elige tus objetivos de fitness',
          step3: 'Reserva tu primera clase',
          complete: '¡Ya estás listo!'
        },
        fr: {
          welcome: 'Bienvenue sur GymApp!',
          step1: 'Configurez votre profil',
          step2: 'Choisissez vos objectifs de fitness',
          step3: 'Réservez votre premier cours',
          complete: 'Vous êtes prêt!'
        }
      },
      
      workoutTypes: {
        en: {
          cardio: 'Cardio',
          strength: 'Strength Training',
          flexibility: 'Flexibility',
          sports: 'Sports',
          other: 'Other'
        },
        es: {
          cardio: 'Cardio',
          strength: 'Entrenamiento de Fuerza',
          flexibility: 'Flexibilidad',
          sports: 'Deportes',
          other: 'Otro'
        },
        fr: {
          cardio: 'Cardio',
          strength: 'Musculation',
          flexibility: 'Flexibilité',
          sports: 'Sports',
          other: 'Autre'
        }
      },
      
      classTypes: {
        en: {
          yoga: 'Yoga',
          pilates: 'Pilates',
          spinning: 'Spinning',
          zumba: 'Zumba',
          crossfit: 'CrossFit',
          boxing: 'Boxing'
        },
        es: {
          yoga: 'Yoga',
          pilates: 'Pilates',
          spinning: 'Spinning',
          zumba: 'Zumba',
          crossfit: 'CrossFit',
          boxing: 'Boxeo'
        },
        fr: {
          yoga: 'Yoga',
          pilates: 'Pilates',
          spinning: 'Spinning',
          zumba: 'Zumba',
          crossfit: 'CrossFit',
          boxing: 'Boxe'
        }
      }
    };
    
    const content = featureTranslations[feature as keyof typeof featureTranslations]?.[language as keyof typeof featureTranslations.onboarding] || {};
    
    res.json({
      success: true,
      message: 'Feature content retrieved successfully',
      data: {
        feature,
        language,
        content
      }
    });
  } catch (error) {
    console.error('Get feature content error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get localized error messages
router.get('/errors/:language', (req, res) => {
  try {
    const { language } = req.params;
    
    const errorMessages = {
      en: {
        VALIDATION_ERROR: 'Please check your input and try again',
        AUTHENTICATION_ERROR: 'Authentication failed',
        AUTHORIZATION_ERROR: 'You are not authorized to perform this action',
        NOT_FOUND_ERROR: 'The requested resource was not found',
        CONFLICT_ERROR: 'A conflict occurred with the current state',
        RATE_LIMIT_ERROR: 'Too many requests. Please try again later',
        SERVER_ERROR: 'An internal server error occurred'
      },
      es: {
        VALIDATION_ERROR: 'Por favor verifica tu entrada e intenta de nuevo',
        AUTHENTICATION_ERROR: 'Autenticación fallida',
        AUTHORIZATION_ERROR: 'No estás autorizado para realizar esta acción',
        NOT_FOUND_ERROR: 'El recurso solicitado no fue encontrado',
        CONFLICT_ERROR: 'Ocurrió un conflicto con el estado actual',
        RATE_LIMIT_ERROR: 'Demasiadas solicitudes. Por favor intenta más tarde',
        SERVER_ERROR: 'Ocurrió un error interno del servidor'
      },
      fr: {
        VALIDATION_ERROR: 'Veuillez vérifier votre saisie et réessayer',
        AUTHENTICATION_ERROR: 'Échec de l\'authentification',
        AUTHORIZATION_ERROR: 'Vous n\'êtes pas autorisé à effectuer cette action',
        NOT_FOUND_ERROR: 'La ressource demandée n\'a pas été trouvée',
        CONFLICT_ERROR: 'Un conflit s\'est produit avec l\'état actuel',
        RATE_LIMIT_ERROR: 'Trop de demandes. Veuillez réessayer plus tard',
        SERVER_ERROR: 'Une erreur interne du serveur s\'est produite'
      }
    };
    
    const errors = errorMessages[language as keyof typeof errorMessages] || errorMessages.en;
    
    res.json({
      success: true,
      message: 'Error messages retrieved successfully',
      data: {
        language,
        errors
      }
    });
  } catch (error) {
    console.error('Get error messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Middleware to detect user's preferred language
export const detectLanguage = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Check Accept-Language header
  const acceptLanguage = req.headers['accept-language'];
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim());
    for (const lang of languages) {
      if (supportedLanguages[lang as keyof typeof supportedLanguages]) {
        req.language = lang;
        break;
      }
    }
  }
  
  // Default to English if no supported language found
  if (!req.language) {
    req.language = 'en';
  }
  
  next();
};

// Helper function to get translated message
export const getTranslation = (key: string, language: string = 'en'): string => {
  const translation = translations[language as keyof typeof translations] || translations.en;
  return translation[key as keyof typeof translation] || key;
};

export default router;
